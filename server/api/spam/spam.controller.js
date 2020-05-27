import async from "async";
import Twitter from "twitter";

import Spam from "./spam.model";
import Queue from "./queue.model";
import User from "../user/user.model";
import config from "../../config/environment";

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
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
    return Spam.count({})
        .exec()
        .then((count) => {
            res.json(count);
        })
        .catch((err) => next(err));
}

export function index(req, res) {
    var index = +req.query.index || 1;

    return Spam.find({}, "-salt -password")
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
                        return res.status(302).json(spam);
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
    Queue.deleteMany({
        spamId: req.params.id
    }).exec();

    return Spam.findByIdAndRemove(req.params.id)
        .exec()
        .then(() => {
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
    Queue.findOne({}, "id")
        .sort({ _id: -1 })
        .then((queue) => {
            if (!spam) {
                return res.status(404).end();
            }

            User.find({
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
                        } : {}).then((queues) => {
                            let index = 0;
                            let innerLimit = 0;

                            async.eachSeries(queues, (queue, cbInner) => {
                                twitter
                                    .post("users/report_spam", {
                                        screen_name: queue.username,
                                        perform_block: false
                                    })
                                    .then((spamed) => {
                                        console.log(spamed);

                                        if (!spamed["screen_name"]) {
                                            return cbInner();
                                        }

                                        user.lastQueueId = queue.id;

                                        user.save().then(() => {
                                            if (
                                                (++index === queues.length) ||
                                                (++innerLimit === config.spamLimitPerUser) ||
                                                (outerLimit++ === config.spamLimitPerApp)
                                            ) {
                                                return cbOuter();
                                            }

                                            cbInner();
                                        });
                                    })
                                    .catch(() => cbInner());
                            });
                        });

                        if (++outerLimit === config.spamLimitPerApp) {
                            return cbOuter();
                        }
                    })
                });
        });

    res.status(204).end();
}

export function authCallback(req, res) {
    res.redirect("/");
}
