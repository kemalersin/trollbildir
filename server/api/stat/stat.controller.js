
import endOfDay from "date-fns/endOfDay";
import startOfDay from "date-fns/startOfDay";

import Stat from '../stat/stat.model';
import Spam from '../spam/spam.model';

function getDate(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getToday() {
    const now = new Date();
    return getDate(now);
}

export function daily(req, res, next) {
    res.status(204).send();
}

export function perUser(req, res) {
    res.status(204).send();
}

export async function all(req, res, next) {
    const startOfToday = getToday();

    var aggregation = [
        {
            $group: {
                _id: null,
                total: {
                    $sum: "$success"
                }
            }
        },
        { $limit: 1 }
    ];

    const perUserTotal = await Spam.count();

    const perUserToday = await Spam.count({
        "createdAt": {
            $gte: startOfDay(startOfToday),
            $lte: endOfDay(startOfToday)
        }
    });

    const dailyTotal = await Stat.aggregate(aggregation);

    aggregation.unshift({
        $match: {
            "sessionDate": {
                $gte: startOfDay(startOfToday),
                $lte: endOfDay(startOfToday)
            }
        }
    });

    const dailyToday = await Stat.aggregate(aggregation);

    res.json({
        perUser: {
            today: perUserToday,
            total: perUserTotal
        },
        daily: {
            today: dailyToday[0] ? dailyToday[0]["total"] : 0,
            total: dailyTotal[0] ? dailyTotal[0]["total"] : 0
        }
    });
}
