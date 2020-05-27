import Twitter from "twitter";

import Report from "./report.model";
import Spam from "../spam/spam.model";
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

export function count(req, res, next) {
    const filter = req.query.filter;
    var query = { reportedBy: req.user.username };

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

    return Report.find({
        reportedBy: req.user.username
    }, "-salt -password")
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
    var query = { reportedBy: req.user.username };

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
            res.status(report ? 204 : 404).end();
        })
        .catch(handleError(res));
}

export function authCallback(req, res) {
    res.redirect("/");
}
