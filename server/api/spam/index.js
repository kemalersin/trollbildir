import {Router} from 'express';

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

router.get('/', auth.hasRole('member'), controller.index);
router.get('/random', auth.isAuthenticated(), bruteforce.prevent, controller.random);
router.get('/count', auth.hasRole('member'), controller.count);
router.get(`/${config.spamRoute}`, controller.spam);
router.get(`/reset-task/${config.spamRoute}`, controller.resetTask);
router.get('/:username', auth.hasRole('member'), controller.show);
router.delete('/:id', auth.hasRole('member'), controller.destroy);
router.post('/', auth.hasRole('member'), controller.create);
router.post('/hide/:id', auth.isAuthenticated(), controller.hide);
router.post('/queue', auth.hasRole('member'), controller.queue);

module.exports = router;