import {Router} from 'express';
import * as controller from './stat.controller';

var router = Router();

router.get('/', controller.all);
router.get('/daily', controller.daily);
router.get('/per-user', controller.perUser);

module.exports = router;