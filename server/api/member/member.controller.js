
import Member from './member.model';
import config from '../../config/environment';
import Twitter from 'twitter';

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        return res.status(statusCode).send(err);
    };
}

export function count(req, res, next) {
    return Member.count({}).exec()
        .then((count) => {
            res.json(count);
        })
        .catch(err => next(err));
}

export function index(req, res) {
    return Member.find({}, '-salt -password').sort({ _id: -1 }).exec()
        .then((members) => {
            res.status(200).json(members);
        })
        .catch(handleError(res));
}

export function create(req, res) {
    let username = req.body.username;

    var twitter = new Twitter({
        consumer_key: config.twitter.clientID,
        consumer_secret: config.twitter.clientSecret,
        access_token_key: req.user.accessToken,
        access_token_secret: req.user.accessTokenSecret
    });

    twitter.get('users/show', { screen_name: username })
        .then((profile) => {
            if (profile.id == req.user.profile.id) {
                return res.status(500).send('Buna hiç gerek yok sahip!');
            }

            Member.findOne({ 'profile.id': profile.id }).exec()
                .then((member) => {
                    if (member) {
                        return res.status(302).json(member);
                    }

                    var newMember = new Member({
                        username: profile.screen_name,
                        profile: profile
                    });

                    return newMember.save()
                        .then((member) =>
                            res.json(member)
                        )
                        .catch(handleError(res));
                })
                .catch(handleError(res));
        })
        .catch((error) => res.status(404).send('Kullanıcı bulunamadı!'));
}

export function show(req, res, next) {
    var username = req.params.username;

    return Member.find({ username: { $regex: new RegExp(username, 'i') } }).exec()
        .then(member => {
            if (!member) {
                return res.status(404).end();
            }

            res.json(member);
        })
        .catch(err => next(err));
}

export function destroy(req, res) {
    return Member.findByIdAndRemove(req.params.id).exec()
        .then(function () {
            res.status(204).end();
        })
        .catch(handleError(res));
}

export function authCallback(req, res) {
    res.redirect('/');
}
