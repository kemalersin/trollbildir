import {Router} from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = Router();

router.get('/', auth.hasRole('member'), controller.index);
router.get('/logout', auth.isAuthenticated(), controller.logout);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/username', auth.isAuthenticated(), controller.changeUsername);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/count', auth.hasRole('member'), controller.count);
router.get('/:username', auth.hasRole('member'), controller.show);
router.post('/', controller.create);
router.post('/password-reset', controller.resetPassword);

module.exports = router;
