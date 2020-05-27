import {Router} from 'express';

import * as controller from './spam.controller';
import * as auth from '../../auth/auth.service';

import config from '../../config/environment';

var router = Router();

router.get('/', auth.hasRole('member'), controller.index);
router.get('/count', auth.hasRole('member'), controller.count);
router.get(`/${config.spamRoute}`, controller.spam);
router.get('/:username', auth.hasRole('member'), controller.show);
router.delete('/:id', auth.hasRole('member'), controller.destroy);
router.post('/', auth.hasRole('member'), controller.create);
router.post('/queue', auth.hasRole('member'), controller.queue);

module.exports = router;