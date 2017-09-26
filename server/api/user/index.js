'use strict';

/*eslint-env node*/

import { Router } from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';
import { checkIdFromParams, checkIfErrors } from '../../helper';

const router = new Router();


router.get('/nuevo', controller.activate);
router.get('/', auth.hasRole('admin'), controller.index);

router.delete(
  '/:id',
  auth.hasRole('admin'),
  checkIdFromParams('id'),
  checkIfErrors(),
  controller.destroy
);

router.patch(
  '/:id',
  auth.hasRole('admin'),
  checkIdFromParams('id'),
  checkIfErrors(),
  controller.revive
);

router.put(
  '/:id/admin',
  auth.hasRole('admin'),
  checkIdFromParams('id'),
  checkIfErrors(),
  controller.updateRole);

router.get('/me', auth.isAuthenticated(), controller.me);

router.put(
  '/:id/settings',
  auth.isAuthenticated(),
  checkIdFromParams('id'),
  checkIfErrors(),
  controller.settings
);

router.get(
  '/:id',
  auth.isAuthenticated(),
  checkIdFromParams('id'),
  checkIfErrors(),
  controller.show
);

router.post('/', controller.create);

module.exports = router;
