import express from 'express';
import passport from 'passport';
import { signToken } from '../auth.service';

import config from '../../config/environment';

var router = express.Router();

router.post('/', function (req, res, next) {
    if (req.body.captcha != req.session.captcha) {
        return res.status(500).send(config.errors.wrongCaptcha);
    }

    passport.authenticate('local', function (err, user, info) {
        var error = err || info;

        if (error) {
            return res.status(401).json(error);
        }

        if (!user) {
            return res.status(404).json(config.errors.tryAgain);
        }

        var token = signToken(user._id, user.role);

        res.json({ token });
    })(req, res, next);
});

export default router;
