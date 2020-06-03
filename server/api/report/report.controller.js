import fs from "fs";
import path from 'path';
import rp from 'request-promise';

import Twitter from "twitter";

import Report from "./report.model";
import Spam from "../spam/spam.model";
import Queue from "../spam/queue.model";

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

function isMember(req) {
    return config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf("member");
}

export function count(req, res, next) {
    const filter = req.query.filter;

    var query = isMember(req) ? {} : { reportedBy: req.user.username };

    if (filter == "onaylananlar") {
        query.isApproved = true;
    }
    else if (filter == "onaylanmayanlar") {
        query.isApproved = false;
    }
    else if (filter == "onay-bekleyenler") {
        query.isApproved = { $eq: null }
    }

    return Report.count(query)
        .exec()
        .then((count) => {
            res.json(count);
        })
        .catch((err) => next(err));
}

export function index(req, res) {
    var index = +req.query.index || 1;

    return Report.find(
        isMember(req) ?
            {} :
            { reportedBy: req.user.username },
        "-salt -password")
        .sort({ _id: -1 })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .exec()
        .then((reports) => {
            res.status(200).json(reports);
        })
        .catch(handleError(res));
}

export function create(req, res) {
    const twitter = getTwitter(req.user);
    const username = req.body.username.trim();
    const notes = req.body.notes;

    twitter
        .get("users/show", { screen_name: username })
        .then((profile) => {
            if (profile.id == req.user.profile.id) {
                return res
                    .status(500)
                    .send("Neden kendinizi bildiresiniz ki?");
            }

            Report.findOne({ "profile.id": profile.id })
                .exec()
                .then((report) => {
                    if (report) {
                        return (report.reportedBy == req.user.username) ?
                            res.status(302).json(report) :
                            res.status(302).end();
                    }

                    Spam.findOne({ "profile.id": profile.id })
                        .exec()
                        .then((spam) => {
                            if (spam) {
                                return res.status(304).end();
                            }

                            const newReport = new Report({
                                username: profile.screen_name,
                                profile: profile,
                                notes: notes,
                                picture: req.file ? req.file.filename : null,
                                reportedBy: req.user.username
                            });

                            return newReport
                                .save()
                                .then((report) => {
                                    res.json(report);
                                })
                                .catch(handleError(res));
                        })
                        .catch(handleError(res));
                })
                .catch(handleError(res));
        })
        .catch((error) => res.status(404).send("Kullanıcı bulunamadı!"));
}

export function show(req, res, next) {
    const filter = req.params.filter;

    var index = +req.query.index || 1;
    var query = isMember(req) ? {} : { reportedBy: req.user.username };

    if (filter == "onaylananlar") {
        query.isApproved = true;
    }
    else if (filter == "onaylanmayanlar") {
        query.isApproved = false;
    }
    else if (filter == "onay-bekleyenler") {
        query.isApproved = { $eq: null }
    }
    else {
        query.username = { $regex: new RegExp(filter, "i") }
    }

    return Report.find(query)
        .sort({ _id: -1 })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .exec()
        .then((report) => {
            if (!report) {
                return res.status(404).end();
            }

            res.json(report);
        })
        .catch((err) => next(err));
}

export function destroy(req, res) {
    Report.findOneAndRemove({
        _id: req.params.id,
        reportedBy: req.user.username,
        isApproved: { $eq: null }
    })
        .exec()
        .then((report) => {
            fs.unlink(path.join(config.root, 'upload', report.picture), (err) => {
                console.log(err);
            });

            res.status(report ? 204 : 404).end();
        })
        .catch(handleError(res));
}

export function approve(req, res) {
    Report.findOne({
        _id: req.params.id,
        isApproved: { $eq: null }
    })
        .exec()
        .then((report) => {
            if (!report) {
                return res.sendStatus(404);
            }

            Spam.findOne({ "profile.id": report.profile.id })
                .exec()
                .then((spam) => {
                    if (spam) {
                        return;
                    }

                    const newSpam = new Spam({
                        username: report.profile.screen_name,
                        profile: report.profile,
                    });

                    return newSpam
                        .save()
                        .then((spam) => {
                            const newQueue = new Queue({
                                spamId: spam.id,
                                username: report.profile.screen_name
                            });

                            newQueue.save();
                        });
                });

            report.isApproved = true;
            report.save().then((report) => res.json(report));
        })
        .catch(handleError(res));
}

export function reject(req, res) {
    Report.findOne({
        _id: req.params.id,
        isApproved: { $eq: null }
    })
        .exec()
        .then((report) => {
            if (!report) {
                return res.sendStatus(404);
            }

            report.isApproved = false;
            report.save().then((report) => res.json(report));
        })
        .catch(handleError(res));
}

export function ban(req, res) {
    Report.findOne({
        _id: req.params.id,
        isApproved: { $ne: false }
    })
        .exec()
        .then((report) => {
            if (!report) {
                return res.sendStatus(404);
            }

            rp({
                method: "POST",
                uri: `${config.blockUrl}/${config.blockRoute}`,
                body: {
                    username: report.username
                },
                json: true
            }).then((result) => {
                res.json(result);
            }).catch(handleError(res));
        })
        .catch(handleError(res));
}

export function blockAll(req, res) {
    Spam.find({ isDeleted: { $ne: true } }).exec()
        .then((spams) => {
            spams.forEach(spam => {
                rp({
                    method: "POST",
                    uri: `${config.blockUrl}/${config.blockRoute}`,
                    body: {
                        username: spam.username
                    },
                    json: true
                })
            });
        });

    res.status(204).send();
}

export function authCallback(req, res) {
    res.redirect("/");
}
