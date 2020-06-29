
import jwt from 'jsonwebtoken';
import randomstring from 'randomstring';

import { assignIn } from "lodash";
import differenceInHours from "date-fns/differenceInHours";

import User from './user.model';
import Code from './code.model';

import config from '../../config/environment';

import {
    deleteEntity,
    validationError,
    handleError,
    handleEntityNotFound
} from '../../helpers';

import mail from '../../components/mail';

function getUserFilter(req) {
    const listType = req.query.listType || 0;

    var filter = {
        provider: "twitter",
        $and: [
            { role: { $ne: "admin" } },
            { _id: { $ne: req.user._id } }
        ],
        isDeleted: { $ne: true }
    };

    if (listType == 1) {
        filter = assignIn(filter, {
            isLocked: true
        });
    }
    else if (listType == 2) {
        filter = assignIn(filter, {
            isBlocked: true
        });
    }
    else if (listType == 3) {
        filter = assignIn(filter, {
            isSuspended: true
        });
    }
    else if (listType == 4) {
        filter = assignIn(filter, {
            tokenExpired: true
        });
    }

    return filter;
}

export function count(req, res, next) {
    return User.count(getUserFilter(req)).exec()
        .then((count) => {
            res.json(count);
        })
        .catch(err => next(err));
}

export function index(req, res) {
    var index = +req.query.index || 1;

    return User.find(getUserFilter(req), '-accessToken -accessTokenSecret')
        .sort({ _id: -1 })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .exec()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(handleError(res));
}

export function logout(req, res) {
    req.user = null;
    res.status(204).send();
}

export function create(req, res) {
    const userData = req.body.user;
    const isAdmin = req.user && req.user.role == "admin";

    let error;

    if (!(
        isAdmin ||
        req.body.captcha == req.session.captcha
    )) {
        error = config.errors.wrongCaptcha;
    }
    else if (!(userData.email && userData.password)) {
        error = config.errors.missingInformation;
    }

    if (error) {
        return res.status(500).send(error);
    }

    User.findOne({
        $or: [
            { email: userData.email },
            { username: userData.email }
        ]
    })
        .exec()
        .then((user) => {
            if (user) {
                if ((!isAdmin || user.role == 'member') && !user.isDeleted) {
                    return res.status(302).send(config.errors.emailExists);
                }

                user.role = 'member';
                user.password = userData.password;

                user.isBanned = false;
                user.isDeleted = false;

                return user.save().then((user) => {
                    res.json({ user });
                });
            }

            let newUser = new User(userData);

            newUser.provider = 'local';
            newUser.role = isAdmin ? 'member' : 'user';

            return newUser.save()
                .then((user) => {
                    const token = jwt.sign({ _id: user._id }, config.secrets.session, {
                        expiresIn: 60 * 60 * 5
                    });

                    res.json({ user, token });
                })
                .catch(validationError(res));
        })
        .catch(handleError(res));
}

export function show(req, res, next) {
    var username = req.params.username;
    var index = +req.query.index || 1;

    return User.find({
        username: { $regex: new RegExp(username, 'i') },
        provider: "twitter",
        $and: [
            { role: { $ne: "admin" } },
            { _id: { $ne: req.user._id } }
        ]
    })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .exec()
        .then(users => {
            if (!users[0]) {
                return res.status(404).end();
            }

            res.json(users);
        })
        .catch(err => next(err));
}

export async function changeUsername(req, res) {
    const userId = req.user._id;
    const name = String(req.body.name);
    const username = String(req.body.username);

    const foundUser = await User.findOne(
        {
            $and: [
                { username },
                { _id: { $ne: userId } }
            ]
        }
    );

    if (foundUser) {
        return res.status(403).end();
    }

    User.findById(userId).exec()
        .then(user => {
            let exceed = false;

            if (user.provider == 'twitter') {
                return res.status(401).end();
            }

            if (user.username == username && user.name == name) {
                return res.status(204).end();
            }

            if (user.username != username) {
                const oldUsernames = user.oldUsernames || [];

                if (oldUsernames.length == 3) {
                    exceed = true;
                }
                else {
                    if (user.username) {
                        oldUsernames.push(user.username);
                    }

                    user.username = username;
                    user.oldUsernames = oldUsernames;
                }
            }

            user.name = name;

            user.save()
                .then(() => {
                    res.status(exceed ? 406 : 200).end();
                })
                .catch(handleError(res));
        })
        .catch(handleError(res));
}

export function changePassword(req, res) {
    const userId = req.user._id;
    const oldPass = String(req.body.oldPassword);
    const newPass = String(req.body.newPassword);

    return User.findById(userId).exec()
        .then(user => {
            if (user.authenticate(oldPass)) {
                user.password = newPass;

                return user.save()
                    .then(() => {
                        res.status(204).end();
                    })
                    .catch(validationError(res));
            } else {
                return res.status(403).end();
            }
        })
        .catch(handleError(res));
}

export function resetPassword(req, res) {
    if (req.body.captcha != req.session.captcha) {
        return res.status(500).send(config.errors.wrongCaptcha);
    }

    User.findOne({
        email: req.body.email,
        provider: "local",
        isDeleted: { $ne: true },
        isBanned: { $ne: true }
    })
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(404).send();
            }

            if (req.body.password && req.body.code) {
                let now = new Date();

                return Code.findOne({
                    user: user._id,
                    randomStr: req.body.code,
                    isUsed: { $ne: true },
                    type: 2
                }).exec()
                    .then((code) => {
                        if (!code || differenceInHours(now, code.createdAt) > 24) {
                            return res.status(401).end();
                        }

                        code.isUsed = true;
                        code.save();

                        user.password = String(req.body.password);

                        return user.save()
                            .then(() => {
                                res.status(204).end();
                            })
                            .catch(validationError(res));
                    })
                    .catch(handleError(res));
            }

            let code = new Code;

            code.user = user._id;
            code.randomStr = randomstring.generate({
                length: 12,
                charset: 'numeric'
            });

            code.save().then((code) => {
                mail.passwordReset.sendMail(
                    user.email,
                    user.name || user.username || "İsimsiz",
                    code.randomStr
                );

                res.status(204).end();
            })
                .catch(handleError(res));
        })
        .catch(handleError(res));
}

export function me(req, res, next) {
    var userId = req.user._id;

    return User.findOne({ _id: userId }, '-salt -password').exec()
        .then(user => { // don't ever give out the password or salt
            if (!user) {
                return res.status(401).end();
            }
            return res.json(user);
        })
        .catch(err => next(err));
}

export function block(req, res) {
    if (req.body.id === req.user._id) {
        return res.status(403).end()
    }

    return User.findById(req.body.id)
        .exec()
        .then(handleEntityNotFound(res))
        .then((user) => {
            if (user) {
                if (user.role == "admin") {
                    return res.status(403).end();
                }

                user.isBanned = true;
                user.save();

                res.status(204).end()
            }

            return null;
        })
        .catch(handleError(res));
}

export function destroy(req, res) {
    if (req.body.id === req.user._id) {
        return res.status(403).end();
    }

    return User.findById(req.params.id)
        .exec()
        .then(handleEntityNotFound(res))
        .then((user) => {
            if (user) {
                if (user.role == "admin") {
                    return res.status(403).end();
                }

                user.isDeleted = true;
                user.save();

                res.status(204).end();
            }

            return null;
        })
        .catch(handleError(res));
}

export function authCallback(req, res) {
    res.redirect('/');
}
