
import Log from './log.model';
import config from "../../config/environment";

function handleError(res, statusCode) {
    statusCode = statusCode || 500;

    return function (err) {
        console.log(err);
        return res.status(statusCode).send(err);
    };
}

export function count(req, res, next) {
    return Log.count({}).exec()
        .then((count) => {
            res.json(count);
        })
        .catch(err => next(err));
}

export function index(req, res) {
    var index = +req.query.index || 1;

    return Log.aggregate([
        {
            '$lookup': {
                from: 'users', localField: 'username', foreignField: 'username', as: 'user'
            }
        },
        {
            '$unwind': '$user'
        },
        {
            '$project': {
                user: { 'username': '$user.username', 'profile': '$user.profile' }
            }
        },
        {
            '$group': {
                "_id": "$sessionDate",
                'users': {
                    '$addToSet': '$user'
                }
            }
        }
    ])
        .sort({ sessionDate: -1 })
        .skip(--index * config.dataLimit)
        .limit(config.dataLimit)
        .exec()
        .then((logs) => {
            res.status(200).json(logs);
        })
        .catch(handleError(res));
}
