import {Router} from 'express';
import multer from 'multer';

import * as controller from './report.controller';
import * as auth from '../../auth/auth.service';

import config from '../../config/environment';

var upload = multer({ dest: 'upload/', limits: {
    fileSize: config.maxFileSize
} });

var router = Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/count', auth.isAuthenticated(), controller.count);
router.get('/:filter', auth.isAuthenticated(), controller.show);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.post('/', auth.isAuthenticated(), upload.single('file'), controller.create);

module.exports = router;