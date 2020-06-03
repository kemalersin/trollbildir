import {Router} from 'express';
import * as controller from './log.controller';

import * as auth from '../../auth/auth.service';

var router = Router();

router.get('/', auth.hasRole('member'), controller.index);
router.get('/count', auth.hasRole('member'), controller.count);

module.exports = router;