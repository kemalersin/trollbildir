import {Router} from 'express';
import * as controller from './member.controller';
import * as auth from '../../auth/auth.service';

var router = Router();

router.get('/', auth.hasRole('member'), controller.index);
router.get('/count', auth.hasRole('admin'), controller.count);
router.get('/:username', auth.hasRole('admin'), controller.show);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.post('/', auth.hasRole('admin'), controller.create);

module.exports = router;