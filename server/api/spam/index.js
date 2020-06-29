import { Router } from 'express';
import compose from 'composable-middleware';

import * as controller from './spam.controller';
import * as auth from '../../auth/auth.service';

import config from '../../config/environment';

var router = Router();

var ExpressBrute = require('express-brute');

var store = new ExpressBrute.MemoryStore();

var bruteforce = new ExpressBrute(store, {
    freeRetries: 100,
    maxWait: 5000
});

function listTypeOk(req, res, next) {
    return compose()
        .use(auth.isAuthenticated())
        .use(function meetsRequirements(req, res, next) {
            if (
                req.user.provider != 'twitter' || (
                    req.user.role == "user" &&
                    (req.query.listType || 0) == 0
                )
            ) {
                return res.status(401).send();
            }

            next();
            return null;
        });
}

router.get('/', listTypeOk(), controller.index);

router.get('/count', listTypeOk(), controller.count);
router.get('/random', auth.isAuthenticated(), bruteforce.prevent, controller.random);

router.get(`/reset-task/${config.spamRoute}`, controller.resetTask);

router.get(`/${config.spamRoute}`, controller.spam);
router.get(`/${config.checkRoute}`, controller.check);

router.get('/:username', listTypeOk(), controller.show);

router.delete('/:id', auth.hasRole('member'), controller.destroy);

router.post('/', auth.hasRole('member'), controller.create);
router.post('/hide/:id', auth.isAuthenticated(), controller.hide);
router.post('/queue', auth.hasRole('member'), controller.queue);

module.exports = router;