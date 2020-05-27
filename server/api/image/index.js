import {Router} from 'express';

import * as controller from './image.controller';

var router = Router();

router.get('/:id', controller.show);

module.exports = router;