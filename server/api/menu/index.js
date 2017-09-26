'use strict';

/*eslint-env node*/

import { Router } from 'express';
import multer from 'multer';
import * as controller from './menu.controller';
import config from '../../config/environment';
import * as auth from '../../auth/auth.service';
import { checkIdFromParams, checkIfErrors } from '../../helper';

const router = new Router();
const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: config.maxFileSize, files: config.fileQuantity }
}).single('image');

router.get(
  '/likes',
  auth.isAuthenticated(),
  controller.getLikes
);

router.get(
  '/:restauranteId/likes',
  auth.isAuthenticated(),
  checkIdFromParams('restauranteId'),
  checkIfErrors(),
  controller.getLike
);

router.post(
  '/:restauranteId/likes',
  auth.isAuthenticated(),
  checkIdFromParams('restauranteId'),
  checkIfErrors(),
  controller.likeRestaurant
);

router.delete(
  '/:restauranteId/likes',
  auth.isAuthenticated(),
  checkIdFromParams('restauranteId'),
  checkIfErrors(),
  controller.unlikeRestaurant
);

/* menu admin management */
router.get(
  '/admin',
  auth.hasRole('admin'),
  controller.readAdmins
);
router.get(
  '/:restauranteId/me/admin',
  checkIdFromParams('restauranteId'),
  checkIfErrors(),
  auth.getUserInfo(),
  auth.getUserMenuAdminStatus(),
  controller.isAdmin
);

router.post(
  '/:restauranteId/:userId/admin',
  auth.hasRole('admin'),
  checkIdFromParams('restauranteId'),
  checkIdFromParams('userId'),
  checkIfErrors(),
  controller.createAdmin
);
router.delete(
  '/:restauranteId/:userId/admin',
  auth.hasRole('admin'),
  checkIdFromParams('restauranteId'),
  checkIdFromParams('userId'),
  checkIfErrors(),
  controller.deleteAdmin
);

/* menu categorias mangement */
router.post(
  '/:restauranteId/categoria',
  auth.isMenuAdmin(),
  checkIdFromParams('restauranteId'),
  checkIfErrors(),
  controller.createCategory
);

router.put(
  '/:restauranteId/:categoriaId/categoria/editar',
  auth.isMenuAdmin(),
  checkIdFromParams('restauranteId'),
  checkIdFromParams('categoriaId'),
  checkIfErrors(),
  auth.nodeBelongsToRestaurant(),
  controller.editCategory
);

router.put(
  '/:restauranteId/:categoriaId/categoria/subir',
  auth.isMenuAdmin(),
  checkIdFromParams('restauranteId'),
  checkIdFromParams('categoriaId'),
  checkIfErrors(),
  auth.nodeBelongsToRestaurant(),
  controller.increaseCategoryPosition
);

router.put(
  '/:restauranteId/:categoriaId/categoria/bajar',
  auth.isMenuAdmin(),
  checkIdFromParams('restauranteId'),
  checkIdFromParams('categoriaId'),
  checkIfErrors(),
  auth.nodeBelongsToRestaurant(),
  controller.decreaseCategoryPosition
);

router.delete(
  '/:restauranteId/:categoriaId/categoria',
  auth.isMenuAdmin(),
  checkIdFromParams('restauranteId'),
  checkIdFromParams('categoriaId'),
  checkIfErrors(),
  auth.nodeBelongsToRestaurant(),
  controller.destroyCategory
);

/* menu platillos management */
router.post(
  '/:restauranteId/:categoriaId/platillo',
  auth.isMenuAdmin(),
  checkIdFromParams('restauranteId'),
  checkIdFromParams('categoriaId'),
  checkIfErrors(),
  auth.nodeBelongsToRestaurant(),
  memoryUpload,
  controller.createDish
);

//TODO: Cambiar ruta en frontend
router.put(
  '/:restauranteId/:categoriaId/:platilloId/platillo/editar',
  auth.isMenuAdmin(),
  checkIdFromParams('restauranteId'),
  checkIdFromParams('categoriaId'),
  checkIdFromParams('platilloId'),
  checkIfErrors(),
  auth.nodeBelongsToRestaurant(),
  memoryUpload,
  controller.editDish
);

router.put(
  '/:restauranteId/:categoriaId/:platilloId/platillo/subir',
  auth.isMenuAdmin(),
  checkIdFromParams('restauranteId'),
  checkIdFromParams('categoriaId'),
  checkIdFromParams('platilloId'),
  checkIfErrors(),
  auth.nodeBelongsToRestaurant(),
  auth.nodeBelongsToCategory(),
  controller.increaseDishPosition
);

router.put(
  '/:restauranteId/:categoriaId/:platilloId/platillo/bajar',
  auth.isMenuAdmin(),
  checkIdFromParams('restauranteId'),
  checkIdFromParams('categoriaId'),
  checkIdFromParams('platilloId'),
  checkIfErrors(),
  auth.nodeBelongsToRestaurant(),
  auth.nodeBelongsToCategory(),
  controller.decreaseDishPosition
);
/*
router.put(
  '/:restauranteId/:categoriaId/:platilloId/platillo/mover/:destinoId',
  auth.isMenuAdmin(),
  auth.nodeBelongsToRestaurant(),
  auth.nodeBelongsToCategory(),
  auth.destinationBelongsToRestaurant(),
  controller.moveDish
);
*/
router.delete(
  '/:restauranteId/:categoriaId/:platilloId/platillo',
  auth.isMenuAdmin(),
  checkIdFromParams('restauranteId'),
  checkIdFromParams('categoriaId'),
  checkIdFromParams('platilloId'),
  checkIfErrors(),
  auth.nodeBelongsToRestaurant(),
  auth.nodeBelongsToCategory(),
  controller.destroyDish
);

/* menu restaurant management */
router.get(
  '/:restaurante',
  auth.getUserInfo(),
  auth.getUserRestuarantAdminStatus(),
  controller.breadcrumbs
);

router.put(
  '/:restauranteId/admin/activate',
  auth.hasRole('admin'),
  checkIdFromParams('restauranteId'),
  checkIfErrors(),
  controller.activateRestaurant
);

router.put(
  '/:restauranteId/admin/deactivate',
  auth.hasRole('admin'),
  checkIdFromParams('restauranteId'),
  checkIfErrors(),
  controller.deactivateRestaurant
);

router.get(
  '/:limit/highlight',
  checkIdFromParams('limit'),
  checkIfErrors(),
  auth.getUserInfo(),
  controller.highlight
);
router.get('/:term/search', auth.getUserInfo(), controller.search);
router.get('/', auth.getUserInfo(), controller.index);
router.post(
  '/',
  auth.hasRole('admin'),
  memoryUpload,
  controller.createRestaurant
);
router.put(
  '/:restauranteId',
  //auth.hasRole('admin'),
  auth.isMenuAdmin(),
  checkIdFromParams('restauranteId'),
  checkIfErrors(),
  memoryUpload,
  controller.editRestaurant
);
router.delete(
  '/:restauranteId',
  auth.hasRole('admin'),
  checkIdFromParams('restauranteId'),
  checkIfErrors(),
  controller.destroyRestaurant
);

//const upload = multer({ dest: 'uploads/' });
/*
const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 1024 * 1024, files: 1 }
}).single('image');

cloudinary.config({
  cloud_name: 'ddx0osgaz',
  api_key: '726988736359978',
  api_secret: 'tsDzRid5j2ffcV_9bqdy9Cq4a_k'
});

const dUri = new Datauri();

const router = new Router();
*/
/*
router.post('/', upload.single('image'), function(req, res, next) {
  console.log('file', req.file);
  console.log('files', req.files);
  console.log('body', req.body);
  res.send('ok').end();
});
*/
/*
router.post('/', memoryUpload, function(req, res, next) {
  console.log('file', req.file);
  dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);
  cloudinary.uploader.upload(dUri.content, function(err, i) {
    if (err) {
      console.log('err cloudinary', err);
      res.json(err).end();
      return next();
    }
    console.log('res cloudinary', i);
    res.json(i).end();
    return next();
  }, {
    width: 300, height: 200, crop: "lfill"
  });
});
*/
module.exports = router;
