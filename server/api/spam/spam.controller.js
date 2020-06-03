import async from "async";
import Twitter from "twitter";

import Spam from "./spam.model";
import Log from "../log/log.model";
import Stat from "../stat/stat.model";
import Queue from "./queue.model";
import User from "../user/user.model";
import config from "../../config/environment";

function handleError(res, statusCode) {
    statusCode = statusCode || 500;

    return function (err) {
        console.log(err);
        return res.status(statusCode).send(err);
    };
}

function getTwitter(user) {
    return new Twitter({
        consumer_key: config.twitter.clientID,
        consumer_secret: config.twitter.clientSecret,
        access_token_key: user.accessToken,
        access_token_secret: user.accessTokenSecret,
    });
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
    return Spam.count({
        isDeleted: { $ne: true }
    })
        .exec()
        .then((count) => {
            res.json(count);
        })
        .catch((err) => next(err));
}

export function index(req, res) {
    var index = +req.query.index || 1;

    return Spam.find({
        isDeleted: { $ne: true }
    }, "-salt -password")
        .sort({ _id: -1 })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .exec()
        .then((spams) => {
            res.status(200).json(spams);
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
        .catch((error) => res.status(404).send("Kullanıcı bulunamadı!"));
}

export function show(req, res, next) {
    const username = req.params.username;
    var index = +req.query.index || 1;

    return Spam.find({ username: { $regex: new RegExp(username, "i") } })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .exec()
        .then((spam) => {
            if (!spam) {
                return res.status(404).end();
            }

            res.json(spam);
        })
        .catch((err) => next(err));
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

export function spam(req, res) {
    const sessionDate = new Date();

    var failedSpams = [];

    var success = 0;
    var failed = 0;

    Queue.findOne({ isDeleted: { $ne: true }}, "id")
        .sort({ _id: -1 })
        .then((queue) => {
            if (!queue) {
                return res.status(404).end();
            }

            User.find({
                isLocked: { $ne: true },
                isSuspended: { $ne: true },
                $or: [
                    { lastQueueId: null },
                    { lastQueueId: { $lt: queue.id } },
                ]
            })
                .select("username lastQueueId accessToken accessTokenSecret")
                .sort({ lastQueueId: 1 })
                .then((users) => {
                    let outerLimit = 0;

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

                                        user.lastQueueId = queue.id;

                                        user.save().then(() => {
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
                                                    failedSpams.push(queue.username);
                                                }
                                                else {
                                                    if (
                                                        errCode == 64 ||
                                                        errCode == 89 ||
                                                        errCode == 326
                                                    ) {
                                                        if (errCode == 64) {
                                                            user.isSuspended = true;
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
                    })
                });
        });

    res.status(204).end();
}

export function authCallback(req, res) {
    res.redirect("/");
}
