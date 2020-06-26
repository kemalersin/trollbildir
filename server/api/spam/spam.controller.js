import async from "async";
import Twitter from "twitter";

import { assignIn, transform } from "lodash";
import differenceInMinutes from "date-fns/differenceInMinutes";

import Spam from "./spam.model";
import Flag from "./flag.model";
import Queue from "./queue.model";
import List from "../list/list.model";
import Log from "../log/log.model";
import Stat from "../stat/stat.model";
import User from "../user/user.model";

import config from "../../config/environment";

import {
    handleError,
    handleEntityNotFound,
    respondWithResult
} from '../../helpers';
import { assign } from "core-js/fn/object";

function getTwitter(user) {
    return new Twitter({
        consumer_key: config.twitter.clientID,
        consumer_secret: config.twitter.clientSecret,
        access_token_key: user ? user.accessToken : config.twitter.accessToken,
        access_token_secret: user ? user.accessTokenSecret : config.twitter.tokenSecret,
    });
}

function getSpamFilter(req) {
    const listType = req.query.listType || 0;

    var filter = {
        isDeleted: { $ne: true }
    };

    if (listType == 1) {
        filter = assignIn(filter, {
            isNotFound: true
        });
    }
    else if (listType == 2) {
        filter = assignIn(filter, {
            isSuspended: true
        });
    }

    return filter;
}

function createMultiple(req, res, usernames) {
    var spams = [];
    const twitter = getTwitter(req.user);

    async.eachSeries(usernames, (username, cb) => {
        username = username.trim();

        twitter
            .get("users/show", { screen_name: username })
            .then((profile) => {
                if (profile.id == req.user.profile.id) {
                    return cb();
                }

                Spam.findOne({ "profile.id": profile.id })
                    .exec()
                    .then((spam) => {
                        if (spam) {
                            return cb();
                        }

                        const newSpam = new Spam({
                            username: profile.screen_name,
                            profile: profile,
                        });

                        newSpam
                            .save()
                            .then((spam) => {
                                const newQueue = new Queue({
                                    spamId: spam.id,
                                    username: profile.screen_name
                                });

                                newQueue.save();

                                spams.push(spam);

                                cb();
                            })
                            .catch(() => cb());
                    })
                    .catch(() => cb());
            })
            .catch(() => cb());
    }, (err) => {
        res.status(200).json(spams);
    });
}

export function count(req, res, next) {
    return Spam.count(getSpamFilter(req))
        .then((spams) => {
            if (!spams) {
                res.json(0);
                return null;
            }

            return spams;
        })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function index(req, res) {
    var index = +req.query.index || 1;

    return Spam.find(getSpamFilter(req))
        .sort({ _id: -1 })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function random(req, res, next) {
    List.aggregate([
        {
            $match: {
                user: req.user._id,
                type: { $in: [1, 2] }
            }
        },
        { $group: { "_id": "$user", spams: { $push: "$spam" } } }
    ]).exec()
        .then((list) => {
            var spams = list.length ? list[0].spams : [];

            Spam.findRandom(
                {
                    _id: { $nin: spams },
                    isDeleted: { $ne: true },
                    isNotFound: { $ne: true },
                    isSuspended: { $ne: true },
                    "profile.description": { $ne: "" },
                    "profile.status": { $exists: true }
                },
                {},
                { limit: config.randomCount }, (err, spams) => {
                    if (err) {
                        return next(err);
                    }

                    res.json(
                        transform(
                            spams,
                            (result, spam) => result.push(spam.profile),
                            []
                        )
                    );
                });
        })
}

export function hide(req, res) {
    Spam.findOne({
        "profile.id_str": req.params.id
    })
        .exec()
        .then(handleEntityNotFound(res))
        .then((spam) => {
            if (spam) {
                let list = new List();

                list.user = req.user._id;
                list.spam = spam._id;

                if (req.body.spamed) {
                    list.type = 2;
                }

                return list.save()
                    .then(() => {
                        res.json(spam.profile);
                    })
                    .catch(handleError(res));
            }

            return null;
        })
        .catch(handleError(res));
}

export function create(req, res) {
    const twitter = getTwitter(req.user);

    var username = req.body.username;
    var usernames = username.split(",");

    if (usernames.length > 1) {
        return createMultiple(req, res, usernames);
    }

    username = username.trim();

    twitter
        .get("users/show", { screen_name: username })
        .then((profile) => {
            if (profile.id == req.user.profile.id) {
                return res
                    .status(500)
                    .send("Neden kendinizi bildiresiniz ki?");
            }

            Spam.findOne({ "profile.id": profile.id })
                .exec()
                .then((spam) => {
                    if (spam) {
                        if (!spam.isDeleted) {
                            return res.status(302).json(spam);
                        }

                        Spam.findByIdAndDelete(spam._id).exec();
                        Queue.deleteMany({ spamId: spam._id }).exec();
                    }

                    const newSpam = new Spam({
                        username: profile.screen_name,
                        profile: profile,
                    });

                    return newSpam
                        .save()
                        .then((spam) => {
                            const newQueue = new Queue({
                                spamId: spam.id,
                                username: profile.screen_name
                            });

                            newQueue.save();

                            res.json(spam);
                        })
                        .catch(handleError(res));
                })
                .catch(handleError(res));
        })
        .catch((error) => res.status(404).send(config.errors.userNotFound));
}

export function show(req, res, next) {
    const username = req.params.username;
    var index = +req.query.index || 1;

    return Spam.find({ username: { $regex: new RegExp(username, "i") } })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function destroy(req, res) {
    const spamId = req.params.id;

    return Spam.findById(spamId)
        .exec()
        .then(function (spam) {
            spam.isDeleted = true;
            spam.save();

            Queue.updateMany({ spamId }, { $set: { isDeleted: true } }).exec();

            res.status(204).end();
        })
        .catch(handleError(res));
}

export function queue(req, res) {
    let newQueue = new Queue({
        spamId: req.body._id,
        username: req.body.username
    });

    newQueue.save()
        .then(() => {
            res.status(204).end();
        })
        .catch(handleError(res));
}

export function resetTask(req, res) {
    const now = new Date();

    Flag.findOne({ "spaming.started": true })
        .exec()
        .then((task) => {
            if (!task) {
                return res.status(404).end();
            }

            if (differenceInMinutes(now, task.spaming.startDate) >= 44) {
                task.spaming.started = false;
                task.spaming.finishDate = now;

                task.save();

                return res.status(204).end();
            }

            return res.status(304).end();
        })
        .catch(handleError(res));
}

export async function spam(req, res) {
    const sessionDate = new Date();

    var failedSpams = [];

    var success = 0;
    var failed = 0;

    const status = await Flag.findOne({ "spaming.started": true }).exec();

    if (status && status["spaming"]) {
        return res.status(304).end();
    }

    Queue.findOne({ isDeleted: { $ne: true } }, "id")
        .sort({ _id: -1 })
        .then((queue) => {
            if (!queue) {
                return res.status(404).end();
            }

            User.find({
                isLocked: { $ne: true },
                isSuspended: { $ne: true },
                isBlocked: { $ne: true },
                $or: [
                    { lastQueueId: null },
                    { lastQueueId: { $lt: queue.id } },
                ]
            })
                .select("username lastQueueId accessToken accessTokenSecret")
                .sort({ lastQueueId: 1 })
                .then((users) => {
                    let outerLimit = 0;

                    Flag.updateOne(
                        { "spaming.started": false },
                        {
                            "spaming.started": true,
                            "spaming.startDate": new Date(),
                            "spaming.finishDate": null
                        }, { upsert: true }
                    ).exec();

                    async.eachSeries(users, (user, cbOuter) => {
                        let twitter = getTwitter(user);

                        Queue.find(user.lastQueueId ? {
                            _id: { $gt: user.lastQueueId }
                        } : { isNotFound: { $ne: true } }).then((queues) => {
                            let innerLimit = 0;
                            let userSpamCounter = 0;

                            async.eachSeries(queues, (queue, cbInner) => {
                                if (
                                    queue.isDeleted ||
                                    queue.isNotFound ||
                                    failedSpams.indexOf(queue.username) !== -1
                                ) {
                                    userSpamCounter++;
                                    return cbInner();
                                }

                                twitter
                                    .post("users/report_spam", {
                                        screen_name: queue.username,
                                        perform_block: false
                                    })
                                    .then((spamed) => {
                                        if (!spamed["screen_name"]) {
                                            failed++;
                                            userSpamCounter++;

                                            return cbInner();
                                        }

                                        success++;

                                        queue.isSuspended = false;
                                        queue.save();

                                        Spam.updateOne({
                                            _id: queue.spamId
                                        }, {
                                            username: spamed.screen_name,
                                            profile: spamed
                                        }).exec();

                                        user.lastQueueId = queue.id;

                                        user.save().then(() => {
                                            let list = new List();

                                            list.user = user.id;
                                            list.spam = queue.spamId;
                                            list.type = 3;

                                            list.save();

                                            if (
                                                (++userSpamCounter === queues.length) ||
                                                (++innerLimit === config.spamLimitPerUser) ||
                                                (outerLimit++ === config.spamLimitPerApp)
                                            ) {
                                                return cbOuter();
                                            }

                                            cbInner();
                                        });
                                    })
                                    .catch((err) => {
                                        failed++;
                                        console.log(user.username, queue.username, err);

                                        if (Array.isArray(err)) {
                                            let errCode = err[0]["code"];

                                            if (errCode) {
                                                Log.create({
                                                    username: user.username,
                                                    queueId: queue._id,
                                                    error: err[0],
                                                    sessionDate,
                                                });

                                                if (
                                                    errCode == 34 ||
                                                    errCode == 50 ||
                                                    errCode == 63
                                                ) {
                                                    (errCode == 63) ?
                                                        queue.isSuspended = true :
                                                        queue.isNotFound = true;

                                                    queue.save();

                                                    Spam.updateOne({
                                                        username: queue.username
                                                    }, {
                                                        checkedAt: new Date(),
                                                        isSuspended: queue.isSuspended,
                                                        isNotFound: queue.isNotFound
                                                    }).exec();

                                                    failedSpams.push(queue.username);
                                                }
                                                else {
                                                    if (
                                                        errCode == 32 ||
                                                        errCode == 36 ||
                                                        errCode == 64 ||
                                                        errCode == 89 ||
                                                        errCode == 326
                                                    ) {
                                                        if (errCode == 32 || errCode == 89) {
                                                            user.isSuspended = true;
                                                        }
                                                        else if (errCode == 36) {
                                                            user.isBlocked = true;
                                                        }
                                                        else {
                                                            (errCode == 89) ?
                                                                user.tokenExpired = true :
                                                                user.isLocked = true;
                                                        }

                                                        user.save();
                                                    }

                                                    return cbOuter();
                                                }
                                            }
                                        }

                                        userSpamCounter++;
                                        cbInner();
                                    });
                            });
                        });

                        if (++outerLimit === config.spamLimitPerApp) {
                            return cbOuter();
                        }
                    }, () => {
                        let stat = new Stat({
                            success,
                            failed,
                            sessionDate
                        });

                        stat.save();

                        Flag.updateOne(
                            { "spaming.started": true },
                            {
                                "spaming.started": false,
                                "spaming.finishDate": new Date()
                            }
                        ).exec();
                    })
                });
        });

    res.status(204).end();
}

export async function check(req, res) {
    let twitter = getTwitter();

    Spam.find({
        isDeleted: { $ne: true },
        isNotFound: { $ne: true }
    })
        .sort({ "checkedAt": 1 })
        .exec()
        .then((spams) => {
            let outerLimit = 0;

            async.eachSeries(spams, (spam, cb) => {
                if (outerLimit === config.checkLimitPerApp) {
                    return cb('Break');
                }

                Spam.findById(spam._id).exec()
                    .then((newSpam) => {
                        if (Date(newSpam.checkedAt) != Date(spam.checkedAt)) {
                            return cb();
                        }

                        twitter
                            .get("users/lookup", {
                                user_id: spam.profile.id_str
                            })
                            .then((spamed) => {
                                if (spamed[0]) {
                                    spam.username = spamed[0].screen_name;
                                    spam.profile = spamed[0];

                                    spam.isNotFound = false;
                                    spam.isSuspended = false;

                                    spam.checkedAt = new Date();

                                    spam.save().then((spam) => {
                                        Queue.updateMany({ spamId: spam._id }, {
                                            $set: {
                                                isNotFound: false,
                                                isSuspended: false
                                            }
                                        })
                                    });
                                }

                                outerLimit++;

                                cb();
                            })
                            .catch((err) => {
                                outerLimit++;
                                console.log(spam.username, err);

                                if (Array.isArray(err)) {
                                    let errCode = err[0]["code"];

                                    if (errCode == 17 || errCode == 34 || errCode == 50 || errCode == 63) {
                                        (errCode == 63) ?
                                            spam.isSuspended = true :
                                            spam.isNotFound = true;

                                        spam.checkedAt = new Date();

                                        spam.save().then((spam) => {
                                            Queue.updateMany({ spamId: spam._id }, {
                                                $set: {
                                                    isNotFound: true,
                                                    isSuspended: true
                                                }
                                            })
                                        });

                                        return cb();
                                    }
                                }

                                cb('Break');
                            });
                    });
            }, () => { });
        })

    res.status(204).end();
}

export function authCallback(req, res) {
    res.redirect("/");
}
