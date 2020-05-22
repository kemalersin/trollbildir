
import User from './user.model';
import config from '../../config/environment';

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        return res.status(statusCode).send(err);
    };
}

export function count(req, res, next) {
    return User.count({}).exec()
        .then((count) => {
            res.json(count);
        })
        .catch(err => next(err));
}

export function index(req, res) {
    var index = +req.query.index || 1;

    return User.find({}, '-accessToken -accessTokenSecret')
        .sort({ _id: -1 })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)        
        .exec()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(handleError(res));
}

export function show(req, res, next) {
    var username = req.params.username;
    var index = +req.query.index || 1;

    return User.find({ username: { $regex: new RegExp(username, 'i') } })
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

export function authCallback(req, res) {
    res.redirect('/');
}
