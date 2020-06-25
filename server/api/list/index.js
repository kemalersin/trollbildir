import {Router} from 'express';

import * as controller from './list.controller';
import * as auth from '../../auth/auth.service';

var router = Router();

router.get('/count/:listType', auth.isAuthenticated(), controller.count);
router.get('/:listType', auth.isAuthenticated(), controller.index);
router.get('/:listType/:username', auth.isAuthenticated(), controller.show);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;