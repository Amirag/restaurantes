'use strict';

/*eslint-env node*/

import { Router } from 'express';
import * as controller from './ciudades.controller';
import * as auth from '../../auth/auth.service';

const router = new Router();

router.get('/', controller.index);
router.post('/', auth.hasRole('admin'), controller.create);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
