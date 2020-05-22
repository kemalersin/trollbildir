import {Router} from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = Router();

router.get('/', auth.hasRole('member'), controller.index);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/count', auth.hasRole('member'), controller.count);
router.get('/:username', auth.hasRole('member'), controller.show);

module.exports = router;
