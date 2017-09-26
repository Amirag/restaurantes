'use strict';

/*eslint-env node*/

import Datauri from 'datauri';
import path from 'path';
import _ from 'lodash';
import config from '../../config/environment';

import {
  MenuNodes,
  Restaurante,
  Categoria,
  Platillo,
  MenuPaths,
  MenuAdmin,
  MenuLikes,
  Visita,
  User,
  Sequelize,
  sequelize
} from '../../sqldb';

import {
  cloud,
  cloudDelete,
  handleError,
  validationError,
  respondWithResult,
  handleEntityNotFound
} from '../../helper';

import {
  readAdminQuery,
  indexQuery,
  searchQuery,
  indexLikeQuery,
  indexQueryAdmin,
  searchQueryAdmin,
  highlightQuery,
  highlightQueryAdmin,
  getDescendantsBreadcrumbsQuery,
  getDescendantsBreadcrumbsQueryAdmin,
  addLeafQuery,
  deleteLeafAndDescendantsQuery,
  // disconnectSubtreeQuery,
  // connectSubtreeQuery,
  nodeCountQuery,
  increasePositionNodeQuery,
  decreasePositionNodeQuery,
  getNodesPositionQuery,
  updatePositionDeleteNodeQuery
} from './menu.queries.js';

const dUri = new Datauri();

export function createRestaurant(req, res) {
  let newImage = null;
  let errors = {
    errors: []
  };

  const newNode = MenuNodes.build({
    active: req.body.active,
    tipo: config.tiposNodos[0],
    authorId: req.user._id
  });
  const newRestaurante = Restaurante.build({
    name: req.body.name,
    description: req.body.description,
    cityId: req.body.cityId,
    keywords: req.body.keywords,
    telephone1: req.body.telephone1,
    telephone2: req.body.telephone2,
    address1: req.body.address1,
    address2: req.body.address2,
    horarioLunesApertura: req.body.horarioLunesApertura,
    horarioLunesCierre: req.body.horarioLunesCierre,
    horarioMartesApertura: req.body.horarioMartesApertura,
    horarioMartesCierre: req.body.horarioMartesCierre,
    horarioMiercolesApertura: req.body.horarioMiercolesApertura,
    horarioMiercolesCierre: req.body.horarioMiercolesCierre,
    horarioJuevesApertura: req.body.horarioJuevesApertura,
    horarioJuevesCierre: req.body.horarioJuevesCierre,
    horarioViernesApertura: req.body.horarioViernesApertura,
    horarioViernesCierre: req.body.horarioViernesCierre,
    horarioSabadoApertura: req.body.horarioSabadoApertura,
    horarioSabadoCierre: req.body.horarioSabadoCierre,
    horarioDomingoApertura: req.body.horarioDomingoApertura,
    horarioDomingoCierre: req.body.horarioDomingoCierre,
    postalCode: req.body.postalCode,
    servicioDomicilio: req.body.servicioDomicilio
  });
  return newNode.validate()
    .catch(err => {
      errors.errors = errors.errors.concat(err.errors);
      return;
    })
    .then(data => {
      newRestaurante._id = 0;
      return newRestaurante.validate();
    })
    .catch(err => {
      errors.errors = errors.errors.concat(err.errors);
      return;
    })
    .then(() => {
      if (errors.errors.length > 0) {
        throw errors;
      }

      if (req.file) {
        dUri.format(
          path.extname(req.file.originalname).toString(),
          req.file.buffer);
        return cloud(dUri.content, {
          width: 300, height: 200, crop: 'lfill'
        });
      }
      return;
    })
    .then(data => {
      if (data && data.public_id) {
        newImage = data.public_id;
        newRestaurante.image = newImage;
      } else {
        newRestaurante.image = 'defaultRestaurant.jpg';
      }
      return sequelize.transaction(function(t) {
        return newNode.save({ transaction: t })
          .then(data => {
            newRestaurante._id = newNode._id;
            return sequelize.Promise.all([
              newRestaurante.save({ transaction: t }),
              MenuPaths.create({
                parent: newNode._id,
                descendant: newNode._id,
                depth: 0
              }, { transaction: t })
            ]);
            // return newRestaurante.save({ transaction: t });
          });
          // .then(data => {
          //   return MenuPaths.create({
          //     parent: newNode._id,
          //     descendant: newNode._id,
          //     depth: 0
          //   }, { transaction: t });
          // });
      });
    })
    // .then(data => {
    //   newRestaurante._id = newNode._id;
    //   return newRestaurante.save();
    // })
    // .then(data => {
    //   return MenuPaths.build({
    //     parent: newNode._id,
    //     descendant: newNode._id,
    //     depth: 0
    //   }).save();
    // })
    .then(data => {
      return res.status(201).send({
        _id: newNode._id,
        name: newRestaurante.name,
        description: newRestaurante.description,
        image: newRestaurante.image,
        likes: newRestaurante.likes,
        cityId: newRestaurante.city,
        keywords: newRestaurante.keywords,
        postalCode: newRestaurante.postalCode,
        telephone1: newRestaurante.telephone1,
        telephone2: newRestaurante.telephone2,
        horarioLunesApertura: newRestaurante.horarioLunesApertura,
        horarioLunesCierre: newRestaurante.horarioLunesCierre,
        horarioMartesApertura: newRestaurante.horarioMartesApertura,
        horarioMartesCierre: newRestaurante.horarioMartesCierre,
        horarioMiercolesApertura: newRestaurante.horarioMiercolesApertura,
        horarioMiercolesCierre: newRestaurante.horarioMiercolesCierre,
        horarioJuevesApertura: newRestaurante.horarioJuevesApertura,
        horarioJuevesCierre: newRestaurante.horarioJuevesCierre,
        horarioViernesApertura: newRestaurante.horarioViernesApertura,
        horarioViernesCierre: newRestaurante.horarioViernesCierre,
        horarioSabadoApertura: newRestaurante.horarioSabadoApertura,
        horarioSabadoCierre: newRestaurante.horarioSabadoCierre,
        horarioDomingoApertura: newRestaurante.horarioDomingoApertura,
        horarioDomingoCierre: newRestaurante.horarioDomingoCierre,
        servicioDomicilio: newRestaurante.servicioDomicilio
      });
    })
    .catch(err => {
      if (newImage) {
        return cloudDelete(newImage)
          .then(() => {
            throw err;
          });
      } else {
        throw err;
      }
    })
    .catch(validationError(res));
}

export function activateRestaurant(req, res) {
  const { restauranteId } = req.params;

  return sequelize.transaction(function(t) {
    return MenuNodes.findOne({
      where: {
        _id: restauranteId,
        active: false
      },
      lock: t.LOCK.UPDATE,
      transaction: t
    })
      .then(entity => {
        if (entity) {
          entity.active = true;
          return entity.save({ transaction: t });
        }
        return null;
      });
  })
  .then(handleEntityNotFound(res))
  .then(respondWithResult(res))
  .catch(handleError(res));
}

export function deactivateRestaurant(req, res) {
  const { restauranteId } = req.params;

  return sequelize.transaction(function(t) {
    return MenuNodes.findOne({
      where: {
        _id: restauranteId,
        active: true
      },
      lock: t.LOCK.UPDATE,
      transaction: t
    })
      .then(entity => {
        if (entity) {
          entity.active = false;
          return entity.save({ transaction: t });
        }
        return null;
      });
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function editRestaurant(req, res) {
  if (!req.user || req.user.role !== 'admin') {
    Reflect.deleteProperty(req.body, 'name');
  }

  let { body, params: { restauranteId } } = req;
  let eRestaurant, eNode, currentImage;
  let errors = {
    errors: []
  };

  let editPromise = function(image) {
    return sequelize.transaction(function(t) {
      return Restaurante.findOne({
        where: { _id: restauranteId },
        lock: t.LOCK.UPDATE,
        transaction: t
      })
        .then(restaurante => {
          if (restaurante) {
            eRestaurant = restaurante;
            return MenuNodes.findOne({
              where: {
                _id: restauranteId,
                deletedAt: null
              },
              lock: t.LOCK.UPDATE,
              transaction: t
            });
          }
          return null;
        })
        .then(node => {
          if (node) {
            eNode = node;
            eNode.active = body.active === undefined || body.active === null ?
              eNode.active :
              body.active;
            eNode.updatedAt = new Date();
            eNode.editorId = req.user._id;
            return eNode.validate();
          }
          return null;
        })
        .catch(err => {
          errors.errors = errors.errors.concat(err.errors);
          return {};
        })
        .then(entity => {
          if (entity) {
            eRestaurant.name = body.name || eRestaurant.name;
            eRestaurant.description = body.description ||
              eRestaurant.description;
            eRestaurant.cityId = body.cityId || eRestaurant.cityId;
            eRestaurant.telephone1 = body.telephone1 || eRestaurant.telephone1;
            eRestaurant.telephone2 = body.telephone2 || eRestaurant.telephone2;
            eRestaurant.address1 = body.address1 || eRestaurant.address1;
            eRestaurant.address2 = body.address2 || eRestaurant.address2;
            eRestaurant.postalCode = body.postalCode || eRestaurant.postalCode;
            eRestaurant.keywords = body.keywords || eRestaurant.keywords;

            eRestaurant.horarioLunesApertura = body.horarioLunesApertura ||
              eRestaurant.horarioLunesApertura;
            eRestaurant.horarioLunesCierre = body.horarioLunesCierre ||
              eRestaurant.horarioLunesCierre;

            eRestaurant.horarioMartesApertura = body.horarioMartesApertura ||
              eRestaurant.horarioMartesApertura;
            eRestaurant.horarioMartesCierre = body.horarioMartesCierre ||
              eRestaurant.horarioMartesCierre;

            eRestaurant.horarioMiercolesApertura =
              body.horarioMiercolesApertura ||
              eRestaurant.horarioMiercolesApertura;
            eRestaurant.horarioMiercolesCierre = body.horarioMiercolesCierre ||
              eRestaurant.horarioMiercolesCierre;

            eRestaurant.horarioJuevesApertura = body.horarioJuevesApertura ||
              eRestaurant.horarioJuevesApertura;
            eRestaurant.horarioJuevesCierre = body.horarioJuevesCierre ||
              eRestaurant.horarioJuevesCierre;

            eRestaurant.horarioViernesApertura = body.horarioViernesApertura ||
              eRestaurant.horarioViernesApertura;
            eRestaurant.horarioViernesCierre = body.horarioViernesCierre ||
              eRestaurant.horarioViernesCierre;

            eRestaurant.horarioSabadoApertura = body.horarioSabadoApertura ||
              eRestaurant.horarioSabadoApertura;
            eRestaurant.horarioSabadoCierre = body.horarioSabadoCierre ||
              eRestaurant.horarioSabadoCierre;

            eRestaurant.horarioDomingoApertura = body.horarioDomingoApertura ||
              eRestaurant.horarioDomingoApertura;
            eRestaurant.horarioDomingoCierre = body.horarioDomingoCierre ||
              eRestaurant.horarioDomingoCierre;

            eRestaurant.servicioDomicilio =
              body.servicioDomicilio === undefined ||
              body.servicioDomicilio === null ?
              eRestaurant.servicioDomicilio :
              body.servicioDomicilio;
            return eRestaurant.validate();
          }
          return null;
        })
        .catch(err => {
          errors.errors = errors.errors.concat(err.errors);
          return {};
        })
        .then(entity => {
          if (entity) {
            if (errors.errors.length > 0) {
              throw errors;
            }

            if (image) {
              currentImage = eRestaurant.image;
              eRestaurant.image = image;
            }

            return eNode.save({ transaction: t });
          }
          return null;
        })
        .then(entity => {
          if (entity) {
            return eRestaurant.save({ transaction: t });
          }
          return null;
        });
    })
    .then(data => {
      if (data) {
        if (image && currentImage !== 'defaultRestaurant.jpg') {
          return cloudDelete(currentImage)
            .then(() => {
              return true;
            })
            .catch(() => {
              return true;
            });
        }
        return true;
      }
      return null;
    })
    .then(data => {
      if (data) {
        return {
          _id: eNode._id,
          name: eRestaurant.name,
          description: eRestaurant.description,
          cityId: eRestaurant.cityId,
          keywords: eRestaurant.keywords,
          image: eRestaurant.image,
          likes: eRestaurant.likes,
          postalCode: eRestaurant.postalCode,
          telephone1: eRestaurant.telephone1,
          telephone2: eRestaurant.telephone2,
          horarioLunesApertura: eRestaurant.horarioLunesApertura,
          horarioLunesCierre: eRestaurant.horarioLunesCierre,
          horarioMartesApertura: eRestaurant.horarioMartesApertura,
          horarioMartesCierre: eRestaurant.horarioMartesCierre,
          horarioMiercolesApertura: eRestaurant.horarioMiercolesApertura,
          horarioMiercolesCierre: eRestaurant.horarioMiercolesCierre,
          horarioJuevesApertura: eRestaurant.horarioJuevesApertura,
          horarioJuevesCierre: eRestaurant.horarioJuevesCierre,
          horarioViernesApertura: eRestaurant.horarioViernesApertura,
          horarioViernesCierre: eRestaurant.horarioViernesCierre,
          horarioSabadoApertura: eRestaurant.horarioSabadoApertura,
          horarioSabadoCierre: eRestaurant.horarioSabadoCierre,
          horarioDomingoApertura: eRestaurant.horarioDomingoApertura,
          horarioDomingoCierre: eRestaurant.horarioDomingoCierre,
          servicioDomicilio: eRestaurant.servicioDomicilio
        };
      }
      return null;
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(err => {
      if (image) {
        return cloudDelete(image)
          .then(() => {
            throw err;
          });
      } else {
        throw err;
      }
    })
    .catch(validationError(res));
  };

  if (req.file) {
    dUri.format(path.extname(req.file.originalname).toString(),
      req.file.buffer);
    return cloud(dUri.content, {
      width: 300, height: 200, crop: 'lfill'
    })
      .then(image => {
        if (image && image.public_id) {
          return editPromise(image.public_id);
        } else {
          return editPromise(null);
        }
      });
  }
  return editPromise(null);

  // return MenuNodes.findOne({
  //   where: {
  //     _id: restauranteId,
  //     deletedAt: null
  //   }
  // })
  //   .then(entity => {
  //     if (entity) {
  //       eNode = entity;
  //       return Restaurante.findOne({
  //         where: {
  //           _id: restauranteId
  //         }
  //       });
  //     }
  //     return null;
  //   })
  //   .then(handleEntityNotFound(res))
  //   .then(entity => {
  //     if (entity) {
  //       eRestaurant = entity;
  //       //eNode.name = body.name || eNode.name;
  //       eNode.active = body.active === undefined || body.active === null ?
  //         eNode.active :
  //         body.active;
  //       eNode.updatedAt = new Date();
  //       eNode.editorId = req.user._id;
  //       return eNode.validate();
  //     }
  //     return null;
  //   })
  //   .catch(err => {
  //     errors.errors = errors.errors.concat(err.errors);
  //     return {};
  //   })
  //   .then(entity => {
  //     if (entity) {
  //       eRestaurant.name = body.name || eRestaurant.name;
  //       eRestaurant.description = body.description ||
  //         eRestaurant.description;
  //       eRestaurant.cityId = body.cityId || eRestaurant.cityId;
  //       eRestaurant.telephone1 = body.telephone1 || eRestaurant.telephone1;
  //       eRestaurant.telephone2 = body.telephone2 || eRestaurant.telephone2;
  //       eRestaurant.address1 = body.address1 || eRestaurant.address1;
  //       eRestaurant.address2 = body.address2 || eRestaurant.address2;
  //       eRestaurant.postalCode = body.postalCode || eRestaurant.postalCode;
  //       eRestaurant.keywords = body.keywords || eRestaurant.keywords;
  //
  //       eRestaurant.horarioLunesApertura = body.horarioLunesApertura ||
  //         eRestaurant.horarioLunesApertura;
  //       eRestaurant.horarioLunesCierre = body.horarioLunesCierre ||
  //         eRestaurant.horarioLunesCierre;
  //
  //       eRestaurant.horarioMartesApertura = body.horarioMartesApertura ||
  //         eRestaurant.horarioMartesApertura;
  //       eRestaurant.horarioMartesCierre = body.horarioMartesCierre ||
  //         eRestaurant.horarioMartesCierre;
  //
  //       eRestaurant.horarioMiercolesApertura =
  //         body.horarioMiercolesApertura ||
  //         eRestaurant.horarioMiercolesApertura;
  //       eRestaurant.horarioMiercolesCierre = body.horarioMiercolesCierre ||
  //         eRestaurant.horarioMiercolesCierre;
  //
  //       eRestaurant.horarioJuevesApertura = body.horarioJuevesApertura ||
  //         eRestaurant.horarioJuevesApertura;
  //       eRestaurant.horarioJuevesCierre = body.horarioJuevesCierre ||
  //         eRestaurant.horarioJuevesCierre;
  //
  //       eRestaurant.horarioViernesApertura = body.horarioViernesApertura ||
  //         eRestaurant.horarioViernesApertura;
  //       eRestaurant.horarioViernesCierre = body.horarioViernesCierre ||
  //         eRestaurant.horarioViernesCierre;
  //
  //       eRestaurant.horarioSabadoApertura = body.horarioSabadoApertura ||
  //         eRestaurant.horarioSabadoApertura;
  //       eRestaurant.horarioSabadoCierre = body.horarioSabadoCierre ||
  //         eRestaurant.horarioSabadoCierre;
  //
  //       eRestaurant.horarioDomingoApertura = body.horarioDomingoApertura ||
  //         eRestaurant.horarioDomingoApertura;
  //       eRestaurant.horarioDomingoCierre = body.horarioDomingoCierre ||
  //         eRestaurant.horarioDomingoCierre;
  //
  //       eRestaurant.servicioDomicilio =
  //         body.servicioDomicilio === undefined ||
  //         body.servicioDomicilio === null ?
  //         eRestaurant.servicioDomicilio :
  //         body.servicioDomicilio;
  //       return eRestaurant.validate();
  //     }
  //     return null;
  //   })
  //   .catch(err => {
  //     errors.errors = errors.errors.concat(err.errors);
  //     return {};
  //   })
  //   .then(entity => {
  //     if (entity) {
  //       if (errors.errors.length > 0) {
  //         throw errors;
  //       }
  //
  //       if (req.file) {
  //         dUri.format(
  //           path.extname(req.file.originalname).toString(),
  //           req.file.buffer);
  //         return cloud(dUri.content, {
  //           width: 300, height: 200, crop: 'lfill'
  //         });
  //       }
  //       return {
  //         image: true
  //       };
  //     }
  //     return null;
  //   })
  //   .then(data => {
  //     if (data) {
  //       if ((data.image === undefined || data.image === null) &&
  //         data.public_id) {
  //         let currentImage = eRestaurant.image;
  //         eRestaurant.image = data.public_id;
  //         if (currentImage !== 'defaultRestaurant.jpg') {
  //           cloudDelete(currentImage);
  //         }
  //       }
  //       return eRestaurant.save();
  //     }
  //     return null;
  //   })
  //   .then(entity => {
  //     if (entity) {
  //       return eNode.save();
  //     }
  //     return null;
  //   })
  //   .then(entity => {
  //     if (entity) {
  //       return {
  //         _id: eNode._id,
  //         name: eRestaurant.name,
  //         description: eRestaurant.description,
  //         cityId: eRestaurant.cityId,
  //         keywords: eRestaurant.keywords,
  //         image: eRestaurant.image,
  //         likes: eRestaurant.likes,
  //         postalCode: eRestaurant.postalCode,
  //         telephone1: eRestaurant.telephone1,
  //         telephone2: eRestaurant.telephone2,
  //         horarioLunesApertura: eRestaurant.horarioLunesApertura,
  //         horarioLunesCierre: eRestaurant.horarioLunesCierre,
  //         horarioMartesApertura: eRestaurant.horarioMartesApertura,
  //         horarioMartesCierre: eRestaurant.horarioMartesCierre,
  //         horarioMiercolesApertura: eRestaurant.horarioMiercolesApertura,
  //         horarioMiercolesCierre: eRestaurant.horarioMiercolesCierre,
  //         horarioJuevesApertura: eRestaurant.horarioJuevesApertura,
  //         horarioJuevesCierre: eRestaurant.horarioJuevesCierre,
  //         horarioViernesApertura: eRestaurant.horarioViernesApertura,
  //         horarioViernesCierre: eRestaurant.horarioViernesCierre,
  //         horarioSabadoApertura: eRestaurant.horarioSabadoApertura,
  //         horarioSabadoCierre: eRestaurant.horarioSabadoCierre,
  //         horarioDomingoApertura: eRestaurant.horarioDomingoApertura,
  //         horarioDomingoCierre: eRestaurant.horarioDomingoCierre,
  //         servicioDomicilio: eRestaurant.servicioDomicilio
  //       };
  //     }
  //     return null;
  //   })
  //   .then(respondWithResult(res))
  //   .catch(validationError(res));
}

export function destroyRestaurant(req, res) {
  let { restauranteId } = req.params;
  let dRestaurant, dNode;

  const deletedAt = new Date();

  return sequelize.transaction(function(t) {
    return Restaurante.findOne({
      where: { _id: restauranteId },
      lock: t.LOCK.UPDATE,
      transaction: t
    })
      .then(entity => {
        if (entity) {
          dRestaurant = entity;
          return MenuNodes.findOne({
            where: {
              _id: entity._id,
              deletedAt: null
            },
            lock: t.LOCK.UPDATE,
            transaction: t
          });
        }
        return null;
      })
      .then(entity => {
        if (entity) {
          dNode = entity;
          return entity.update({
            editorId: req.user._id,
            deletedAt
          }, { transaction: t });
        }
        return null;
      });
  })
  .then(entity => {
    if (entity) {
      if (dRestaurant.image !== 'defaultRestaurant.jpg') {
        return cloudDelete(dRestaurant.image)
          .then(() => {
            return true;
          })
          .catch(() => {
            return true;
          });
      }
      return true;
    }
    return null;
  })
  .then(entity => {
    if (entity) {
      return {
        _id: dNode._id,
        name: dNode.name,
        description: dRestaurant.description,
        cityId: dRestaurant.cityId,
        image: dRestaurant.image,
        likes: dRestaurant.likes,
        postalCode: dRestaurant.postalCode,
        telephone1: dRestaurant.telephone1,
        telephone2: dRestaurant.telephone2,
        horarioLunesApertura: dRestaurant.horarioLunesApertura,
        horarioLunesCierre: dRestaurant.horarioLunesCierre,
        horarioMartesApertura: dRestaurant.horarioMartesApertura,
        horarioMartesCierre: dRestaurant.horarioMartesCierre,
        horarioMiercolesApertura: dRestaurant.horarioMiercolesApertura,
        horarioMiercolesCierre: dRestaurant.horarioMiercolesCierre,
        horarioJuevesApertura: dRestaurant.horarioJuevesApertura,
        horarioJuevesCierre: dRestaurant.horarioJuevesCierre,
        horarioViernesApertura: dRestaurant.horarioViernesApertura,
        horarioViernesCierre: dRestaurant.horarioViernesCierre,
        horarioSabadoApertura: dRestaurant.horarioSabadoApertura,
        horarioSabadoCierre: dRestaurant.horarioSabadoCierre,
        horarioDomingoApertura: dRestaurant.horarioDomingoApertura,
        horarioDomingoCierre: dRestaurant.horarioDomingoCierre,
        servicioDomicilio: dRestaurant.servicioDomicilio
      };
    }
    return null;
  })
  .then(handleEntityNotFound(res))
  .then(respondWithResult(res))
  .catch(handleError(res));
}

export function index(req, res) {
  const query = req.user && req.user.role === 'admin' ? indexQueryAdmin :
    indexQuery;

  return sequelize.query(query, {
    type: Sequelize.QueryTypes.SELECT
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function search(req, res) {
  let term = decodeURI(req.params.term);

  const query = req.user && req.user.role === 'admin' ? searchQueryAdmin :
    searchQuery;

  return sequelize.query(query, {
    replacements: { term },
    type: Sequelize.QueryTypes.SELECT
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function highlight(req, res) {
  let { limit } = req.params;

  const query = req.user && req.user.role === 'admin' ? highlightQueryAdmin :
    highlightQuery;

  return sequelize.query(query, {
    replacements: { limit },
    type: Sequelize.QueryTypes.SELECT
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function readAdmins(req, res) {
  return sequelize.query(readAdminQuery, {
    type: Sequelize.QueryTypes.SELECT
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function createAdmin(req, res) {
  let { restauranteId, userId } = req.params;

  return sequelize.transaction(function(t) {
    return Restaurante.findOne({
      where: { _id: restauranteId },
      attributes: ['_id'],
      lock: t.LOCK.SHARE,
      transaction: t
    })
    .then(restaurante => {
      if (restaurante) {
        return User.findOne({
          where: { _id: userId },
          attributes: ['_id'],
          lock: t.LOCK.SHARE,
          transaction: t
        });
      }
    })
    .then(user => {
      if (user) {
        return MenuAdmin.create({
          restauranteId,
          userId
        }, { transaction: t });
      }
      return null;
    });
  })
  .then(respondWithResult(res, 201))
  .catch(validationError(res));
}

export function deleteAdmin(req, res) {
  let { restauranteId, userId } = req.params;
  let original;

  return sequelize.transaction(function(t) {
    return MenuAdmin.find({
      where: {
        restauranteId,
        userId
      },
      lock: t.LOCK.UPDATE,
      transaction: t
    })
    .then(entity => {
      if (entity) {
        original = _.cloneDeep(entity);
        return entity.destroy({ transaction: t });
      }
      return null;
    });
  })
    .then(data => {
      if (data) {
        return original;
      }
      return null;
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function isAdmin(req, res) {
  let { restauranteId } = req.params;

  if (req.user && req.user.menuAdmin) {
    return res.status(200).send({
      _id: restauranteId,
      admin: true
    });
  } else {
    return res.status(200).send({
      _id: restauranteId,
      admin: false
    });
  }
}

export function breadcrumbs(req, res) {
  let query;
  let { restaurante } = req.params;
  let _id;
  restaurante = decodeURI(restaurante).replace(/_/g, ' ');


  if (req.user && req.user.menuAdmin) {
    query = getDescendantsBreadcrumbsQueryAdmin;
  } else {
    query = getDescendantsBreadcrumbsQuery;
  }

  return Restaurante.findOne({
    where: { name: restaurante }
  })
    .then(entity => {
      if (entity) {
        if (req.user && req.user.menuAdmin) {
          return MenuNodes.findOne({
            where: {
              _id: entity._id
            }
          });
        }
        return MenuNodes.findOne({
          where: {
            _id: entity._id,
            active: true
          }
        });
      }
      return null;
    })
    .then(handleEntityNotFound(res))
    .then(entity => {
      if (entity) {
        _id = entity._id;
        if (req.user && req.user.menuAdmin) {
          return entity;
        }
        return sequelize.transaction(function(t) {
          let ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress;
          return sequelize.Promise.all([
            Visita.create({
              ip,
              restauranteId: _id
            }, { transaction: t }),
            Restaurante.update({
              visitas: sequelize.literal('visitas + 1')
            }, {
              where: { _id },
              transaction: t
            })
          ]);
        });
      }
      return null;
    })
    .then(t => {
      if (t) {
        return sequelize.query(query, {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            nodeId: _id
          }
        });
      }
      return null;
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}
/*
export function createCategory(req, res) {
  let { name, active } = req.body;
  let { restauranteId } = req.params;

  return Restaurante.findOne({
    where: {
      _id: restauranteId
    }
  })
    .then(handleEntityNotFound(res))
    .then(restaurante => {
      if (restaurante) {
        return MenuNodes.build({
          active,
          tipo: config.tiposNodos[1],
          authorId: req.user._id
        }).save();
      }
      return null;
    })
    .then(node => {
      if (node) {
        return sequelize.query(nodeCountQuery, {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            parentNodeId: restauranteId,
            depth: 1
          }
        })
          .then(count => {
            return Categoria.build({
              name,
              _id: node._id,
              position: count[0].count + 1
            })
              .save()
              .then(categoria => {
                return sequelize.query(addLeafQuery, {
                  type: Sequelize.QueryTypes.INSERT,
                  replacements: {
                    newNodeId: node._id,
                    parentId: restauranteId
                  }
                });
              })
              .then(() => {
                return res.status(201).send({
                  _id: node._id,
                  name,
                  active: node.active,
                  position: count[0].count + 1
                });
              });
          });
      }
      return null;
    })
    .catch(validationError(res));
}
*/

export function createCategory(req, res) {
  let { name, active } = req.body;
  let { restauranteId } = req.params;
  let response = {};

  // Pasos:
  // 1. Reviso si existe el restaurante
  // 2. Creo el nodo de la categoria
  // 3. Reviso cuantos children tiene el restaurante
  // 4. Creo la categoria
  // 5. Hago update a la tabla jerarquica
  // 6. Regreso el resultado
  return sequelize.transaction(function(t) {
    return Restaurante.findOne({
      where: { _id: restauranteId },
      attributes: ['_id'],
      lock: t.LOCK.SHARE,
      transaction: t
    })
    .then(restaurante => {
      if (restaurante) {
        return MenuNodes.create({
          active,
          tipo: config.tiposNodos[1],
          authorId: req.user._id
        }, { transaction: t });
      }
      return null;
    })
    .then(node => {
      if (node) {
        response._id = node._id;
        response.name = name;
        response.active = node.active;
        return sequelize.query(nodeCountQuery, {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            parentNodeId: restauranteId,
            depth: 1
          },
          transaction: t
        })
          .then(count => {
            response.position = count[0].count + 1;
            return Categoria.create({
              name,
              _id: node._id,
              position: count[0].count + 1
            }, { transaction: t });
          })
          .then(categoria => {
            return sequelize.query(addLeafQuery, {
              type: Sequelize.QueryTypes.INSERT,
              replacements: {
                newNodeId: node._id,
                parentId: restauranteId
              },
              transaction: t
            });
          });
      }
      return null;
    });
  })
  .then(handleEntityNotFound(res))
  .then(entity => {
    if (entity) {
      return res.status(201).send(response);
    }
    return null;
  })
  .catch(validationError(res));
}

// export function editCategory(req, res) {
//   let { name, active } = req.body;
//   let { categoriaId, restauranteId } = req.params;
//   let eCategoria, eNode;
//   let errors = {
//     errors: []
//   };
//
//   return Categoria.findOne({
//     where: {
//       _id: categoriaId
//     }
//   })
//     .then(handleEntityNotFound(res))
//     .then(categoria => {
//       if (categoria) {
//         eCategoria = categoria;
//         return MenuNodes.findOne({
//           where: {
//             _id: categoriaId
//           }
//         });
//       }
//       return null;
//     })
//     .then(entity => {
//       if (entity) {
//         eNode = entity;
//         eNode.editorId = req.user._id;
//         eNode.active = active === undefined || active === null ?
//           eNode.active :
//           active;
//         eCategoria.name = name || eCategoria.name;
//         return eNode.validate();
//       }
//       return null;
//     })
//     .catch(err => {
//       errors.errors = errors.errors.concat(err.errors);
//       return {};
//     })
//     .then(entity => {
//       if (entity) {
//         return eCategoria.validate();
//       }
//       return null;
//     })
//     .catch(err => {
//       errors.errors = errors.errors.concat(err.errors);
//       return {};
//     })
//     .then(entity => {
//       if (entity) {
//         if (errors.errors.length > 0) {
//           throw errors;
//         }
//         return eNode.save();
//       }
//       return null;
//     })
//     .then(entity => {
//       if (entity) {
//         return eCategoria.save();
//       }
//       return null;
//     })
//     .then(entity => {
//       if (entity) {
//         return {
//           _id: restauranteId,
//           child: {
//             _id: eNode._id,
//             name: eCategoria.name,
//             active: eNode.active
//           }
//         };
//       }
//       return null;
//     })
//     .then(respondWithResult(res))
//     .catch(validationError(res));
// }

export function editCategory(req, res) {
  let { name, active } = req.body;
  let { categoriaId, restauranteId } = req.params;
  let eCategoria, eNode;
  let errors = {
    errors: []
  };

  // Checo que la categoria exista for update
  // validate de nodo
  // validate de categoria
  // guardar nodo
  // guardar categoria
  // return

  return sequelize.transaction(function(t) {
    return Restaurante.findOne({
      where: { _id: restauranteId },
      attributes: ['_id'],
      lock: t.LOCK.SHARE,
      transaction: t
    })
    .then(restaurante => {
      if (restaurante) {
        return Categoria.findOne({
          where: { _id: categoriaId },
          lock: t.LOCK.UPDATE,
          transaction: t
        });
      }
      return null;
    })
    .then(categoria => {
      if (categoria) {
        eCategoria = categoria;
        return MenuNodes.findOne({
          where: { _id: categoriaId },
          lock: t.LOCK.UPDATE,
          transaction: t
        });
      }
      return null;
    })
    .then(entity => {
      if (entity) {
        eNode = entity;
        eNode.editorId = req.user._id;
        eNode.active = active === undefined || active === null ?
          eNode.active : active;
        eCategoria.name = name || eCategoria.name;
        return eNode.validate();
      }
      return null;
    })
    .catch(err => {
      errors.errors = errors.errors.concat(err.errors);
      return {};
    })
    .then(entity => {
      if (entity) {
        return eCategoria.validate();
      }
      return null;
    })
    .catch(err => {
      errors.errors = errors.errors.concat(err.errors);
      return {};
    })
    .then(entity => {
      if (entity) {
        if (errors.errors.length > 0) {
          throw errors;
        }
        return eNode.save({ transaction: t });
      }
      return null;
    })
    .then(entity => {
      if (entity) {
        return eCategoria.save({ transaction: t });
      }
      return null;
    });
  })
    .then(entity => {
      if (entity) {
        return {
          _id: restauranteId,
          child: {
            _id: eNode._id,
            name: eCategoria.name,
            active: eNode.active
          }
        };
      }
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(validationError(res));
}

// export function increaseCategoryPosition(req, res) {
//   let { categoriaId, restauranteId } = req.params;
//
//   const errors = [];
//
//   if (isNaN(categoriaId) || (categoriaId ^ 0) !== +categoriaId) {
//     errors.push({
//       message: 'El identificador de la categoria no es válido',
//       type: 'Validation error',
//       path: 'categoriaId',
//       value: categoriaId,
//       raw: {}
//     });
//   }
//
//   if (isNaN(restauranteId) || (restauranteId ^ 0) !== +restauranteId) {
//     errors.push({
//       message: 'El identificador del restaurante no es válido',
//       type: 'Validation error',
//       path: 'restauranteId',
//       value: restauranteId,
//       raw: {}
//     });
//   }
//
//   categoriaId = +categoriaId;
//   restauranteId = +restauranteId;
//
//   if (errors.length > 0) {
//     return res.status(400).send(errors);
//   }
//
//   return Categoria.findOne({
//     where: {
//       _id: categoriaId
//     }
//   })
//     .then(handleEntityNotFound(res))
//     .then(categoria => {
//       if (categoria) {
//         return sequelize.query(nodeCountQuery, {
//           type: Sequelize.QueryTypes.SELECT,
//           replacements: {
//             depth: 1,
//             parentNodeId: restauranteId
//           }
//         })
//           .then(count => {
//             if (count[0].count === categoria.position) {
//               res.status(204).end();
//               return null;
//             }
//             return sequelize.query(
//               increasePositionNodeQuery(Categoria.tableName), {
//                 type: Sequelize.QueryTypes.UPDATE,
//                 replacements: {
//                   depth: 1,
//                   parentNodeId: restauranteId,
//                   nodePosition: categoria.position,
//                   nodeId: categoria._id
//                 }
//               });
//           });
//       }
//       return null;
//     })
//     .then(data => {
//       if (data) {
//         return sequelize.query(
//           getNodesPositionQuery(Categoria.tableName), {
//             type: Sequelize.QueryTypes.SELECT,
//             replacements: {
//               depth: 1,
//               parentNodeId: restauranteId
//             }
//           }
//         );
//       }
//       return null;
//     })
//     .then(respondWithResult(res))
//     .catch(validationError(res));
// }

export function increaseCategoryPosition(req, res) {
  let { categoriaId, restauranteId } = req.params;

  // Checo que la categoria exista
  // Checo la cantidad de categorias pertenecientes al restaurante
  // Si la cuenta es igual a la cuenta actual regreso 204 y finaliza
  // Si no, hago un update a la posicion
  // Regreso las posiciones actuales

  return sequelize.transaction(function(t) {
    return Restaurante.findOne({
      where: { _id: restauranteId },
      attributes: ['_id'],
      lock: t.LOCK.SHARE,
      transaction: t
    })
      .then(restaurante => {
        if (restaurante) {
          return Categoria.findOne({
            where: { _id: categoriaId },
            lock: t.LOCK.UPDATE,
            transaction: t
          });
        }
        return null;
      })
      .then(categoria => {
        if (categoria) {
          return sequelize.query(nodeCountQuery, {
            type: Sequelize.QueryTypes.SELECT,
            replacements: {
              depth: 1,
              parentNodeId: restauranteId
            },
            transaction: t
          })
            .then(count => {
              if (count[0].count === categoria.position) {
                res.status(204).end();
                return null;
              }
              return sequelize.query(
                increasePositionNodeQuery(Categoria.tableName), {
                  type: Sequelize.QueryTypes.UPDATE,
                  replacements: {
                    depth: 1,
                    parentNodeId: restauranteId,
                    nodePosition: categoria.position,
                    nodeId: categoria._id
                  },
                  transaction: t
                });
            });
        }
        return null;
      });
  })
  .then(data => {
    if (data) {
      return sequelize.query(
        getNodesPositionQuery(Categoria.tableName), {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            depth: 1,
            parentNodeId: restauranteId
          }
        }
      );
    }
  })
  .then(handleEntityNotFound(res))
  .then(respondWithResult(res))
  .catch(validationError(res));
}

export function decreaseCategoryPosition(req, res) {
  let { categoriaId, restauranteId } = req.params;

  return sequelize.transaction(function(t) {
    return Restaurante.findOne({
      where: { _id: restauranteId },
      attributes: ['_id'],
      lock: t.LOCK.SHARE,
      transaction: t
    })
      .then(restaurante => {
        if (restaurante) {
          return Categoria.findOne({
            where: { _id: categoriaId },
            lock: t.LOCK.UPDATE,
            transaction: t
          });
        }
        return null;
      })
      .then(categoria => {
        if (categoria) {
          return sequelize.query(nodeCountQuery, {
            type: Sequelize.QueryTypes.SELECT,
            replacements: {
              depth: 1,
              parentNodeId: restauranteId
            },
            transaction: t
          })
            .then(count => {
              if (categoria.position === 1) {
                res.status(204).end();
                return null;
              }
              return sequelize.query(
                decreasePositionNodeQuery(Categoria.tableName), {
                  type: Sequelize.QueryTypes.UPDATE,
                  replacements: {
                    depth: 1,
                    parentNodeId: restauranteId,
                    nodePosition: categoria.position,
                    nodeId: categoria._id
                  },
                  transaction: t
                });
            });
        }
        return null;
      });
  })
  .then(data => {
    if (data) {
      return sequelize.query(
        getNodesPositionQuery(Categoria.tableName), {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            depth: 1,
            parentNodeId: restauranteId
          }
        }
      );
    }
  })
  .then(handleEntityNotFound(res))
  .then(respondWithResult(res))
  .catch(validationError(res));
  //
  // return Categoria.findOne({
  //   where: {
  //     _id: categoriaId
  //   }
  // })
  //   .then(handleEntityNotFound(res))
  //   .then(categoria => {
  //     if (categoria) {
  //       if (categoria.position === 1) {
  //         res.status(204).end();
  //         return null;
  //       }
  //       return sequelize.query(
  //         decreasePositionNodeQuery(Categoria.tableName), {
  //           type: Sequelize.QueryTypes.UPDATE,
  //           replacements: {
  //             depth: 1,
  //             parentNodeId: restauranteId,
  //             nodePosition: categoria.position,
  //             nodeId: categoria._id
  //           }
  //         });
  //     }
  //     return null;
  //   })
  //   .then(data => {
  //     if (data) {
  //       return sequelize.query(
  //         getNodesPositionQuery(Categoria.tableName), {
  //           type: Sequelize.QueryTypes.SELECT,
  //           replacements: {
  //             depth: 1,
  //             parentNodeId: restauranteId
  //           }
  //         }
  //       );
  //     }
  //     return null;
  //   })
  //   .then(respondWithResult(res))
  //   .catch(validationError(res));
}

export function destroyCategory(req, res) {
  let { categoriaId, restauranteId } = req.params;
  let original;

  return sequelize.transaction(function(t) {
    return Restaurante.findOne({
      where: { _id: restauranteId },
      attributes: ['_id'],
      lock: t.LOCK.SHARE,
      transaction: t
    })
      .then(restaurante => {
        if (restaurante) {
          return Categoria.findOne({
            where: { _id: categoriaId },
            lock: t.LOCK.UPDATE,
            transaction: t
          });
        }
        return null;
      })
      .then(entity => {
        if (entity) {
          original = _.cloneDeep(entity);
          return sequelize.query(deleteLeafAndDescendantsQuery, {
            type: Sequelize.QueryTypes.DELETE,
            replacements: { deletedNodeId: original._id },
            transaction: t
          })
            .then(() => {
              return sequelize.query(updatePositionDeleteNodeQuery(
                Categoria.tableName
              ), {
                type: Sequelize.QueryTypes.UPDATE,
                replacements: {
                  depth: 1,
                  parentNodeId: restauranteId,
                  deletedNodePosition: original.position
                },
                transaction: t
              });
            });
        }
        return null;
      });
  })
  .then(data => {
    if (data) {
      return original;
    }
    return null;
  })
  .then(handleEntityNotFound(res))
  .then(respondWithResult(res))
  .catch(handleError(res));
  //
  //
  // return Categoria.findOne({
  //   where: {
  //     _id: categoriaId
  //   }
  // })
  //   .then(handleEntityNotFound(res))
  //   .then(entity => {
  //     if (entity) {
  //       let original = _.cloneDeep(entity);
  //       return sequelize.query(deleteLeafAndDescendantsQuery, {
  //         type: Sequelize.QueryTypes.DELETE,
  //         replacements: {
  //           deletedNodeId: original._id
  //         }
  //       })
  //         .then(() => {
  //           return sequelize.query(updatePositionDeleteNodeQuery(
  //             Categoria.tableName
  //           ), {
  //             type: Sequelize.QueryTypes.UPDATE,
  //             replacements: {
  //               depth: 1,
  //               parentNodeId: restauranteId,
  //               deletedNodePosition: original.position
  //             }
  //           })
  //             .then(() => original);
  //         });
  //       //return original;
  //     }
  //     return null;
  //   })
  //   .then(respondWithResult(res))
  //   .catch(handleError(res));
}

// POST '/:restauranteId/:categoriaId/platillo'
export function createDish(req, res) {
  let { restauranteId, categoriaId } = req.params;
  let newImage;

  let errors = {
    errors: []
  };

  const newNode = MenuNodes.build({
    active: req.body.active,
    tipo: config.tiposNodos[2],
    authorId: req.user._id
  });
  const newPlatillo = Platillo.build({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price
  });

  return newNode.validate()
    .catch(err => {
      errors.errors = errors.errors.concat(err.errors);
      return;
    })
    .then(entity => {
      newPlatillo._id = 0;
      return newPlatillo.validate();
    })
    .catch(err => {
      errors.errors = errors.errors.concat(err.errors);
      return;
    })
    .then(() => {
      if (errors.errors.length > 0) {
        throw errors;
      }

      if (req.file) {
        dUri.format(
          path.extname(req.file.originalname).toString(),
          req.file.buffer);

        return cloud(dUri.content, {
          width: 500, height: 500
        });
      }
      return null;
    })
    .then(data => {
      if (data && data.public_id) {
        newImage = data.public_id;
        newPlatillo.image = newImage;
      } else {
        newPlatillo.image = null;
      }
      // newPlatillo.image = data ? data.public_id : null;
      return sequelize.transaction(function(t) {
        return Restaurante.findOne({
          where: { _id: restauranteId },
          attributes: ['_id'],
          lock: t.LOCK.SHARE,
          transaction: t
        })
        .then(restaurante => {
          if (restaurante) {
            return Categoria.findOne({
              where: { _id: categoriaId },
              attributes: ['_id'],
              lock: t.LOCK.SHARE,
              transaction: t
            });
          }
          return null;
        })
        .then(categoria => {
          if (categoria) {
            return newNode.save({ transaction: t });
          }
          return null;
        })
        .then(node => {
          if (node) {
            return sequelize.query(nodeCountQuery, {
              type: Sequelize.QueryTypes.SELECT,
              replacements: {
                parentNodeId: categoriaId,
                depth: 1
              },
              transaction: t
            });
          }
          return null;
        })
        .then(count => {
          if (count) {
            newPlatillo._id = newNode._id;
            newPlatillo.position = count[0].count + 1;
            return newPlatillo.save({ transaction: t });
          }
          return null;
        })
        .then(platillo => {
          if (platillo) {
            return sequelize.query(addLeafQuery, {
              type: Sequelize.QueryTypes.INSERT,
              replacements: {
                newNodeId: newNode._id,
                parentId: categoriaId
              },
              transaction: t
            });
          }
          return null;
        });
      });
    })
    .then(handleEntityNotFound(res))
    .then(leaf => {
      if (leaf) {
        return res.status(201).send({
          _id: newNode._id,
          name: newPlatillo.name,
          active: newNode.active,
          description: newPlatillo.description,
          price: newPlatillo.price,
          position: newPlatillo.position,
          image: newPlatillo.image
        });
      }
      return null;
    })
    .catch(err => {
      if (newImage) {
        return cloudDelete(newImage)
          .then(() => {
            throw err;
          });
      } else {
        throw err;
      }
    })
    .catch(validationError(res));
}

// PUT '/:restauranteId/:platilloId/platillo/editar'
export function editDish(req, res) {
  let { name, active, description, price } = req.body;
  let { restauranteId, categoriaId, platilloId } = req.params;
  let eNode, ePlatillo, currentImage;

  let validationErrors = {
    errors: []
  };

  let editPromise = function(image) {
    return sequelize.transaction(function(t) {
      return Restaurante.findOne({
        where: { _id: restauranteId },
        attributes: ['_id'],
        lock: t.LOCK.SHARE,
        transaction: t
      })
      .then(restaurante => {
        if (restaurante) {
          return Categoria.findOne({
            where: { _id: categoriaId },
            attributes: ['_id'],
            lock: t.LOCK.SHARE,
            transaction: t
          });
        }
        return null;
      })
      .then(categoria => {
        if (categoria) {
          return Platillo.findOne({
            where: { _id: platilloId },
            lock: t.LOCK.UPDATE,
            transaction: t
          });
        }
        return null;
      })
      .then(platillo => {
        if (platillo) {
          // const platilloOriginal = _.cloneDeep(platillo);
          ePlatillo = platillo;
          platillo.description = description || platillo.description;
          platillo.name = name || platillo.name;
          platillo.price = price || platillo.price;
          return MenuNodes.findOne({
            where: { _id: platilloId },
            lock: t.LOCK.UPDATE,
            transaction: t
          })
            .then(node => {
              eNode = node;
              eNode.editorId = req.user._id;
              eNode.active = active === undefined || active === null ?
                eNode.active : active;
              eNode.updatedAt = new Date();
              return eNode.validate();
            })
            .catch(err => {
              validationErrors.errors =
                validationErrors.errors.concat(err.errors);
              return;
            })
            .then(() => {
              return platillo.validate();
            })
            .catch(err => {
              validationErrors.errors =
                validationErrors.errors.concat(err.errors);
              return;
            })
            .then(() => {
              if (validationErrors.errors.length > 0) {
                throw validationErrors;
              }

              if (image) {
                currentImage = platillo.image;
                platillo.image = image;
              }
              return eNode.save({ transaction: t });
            })
            .then(() => {
              return platillo.save({ transaction: t });
            });
        }
        return null;
      });
    })
    .then(data => {
      if (data) {
        if (image && currentImage !== '') {
          return cloudDelete(currentImage)
            .then(() => {
              return true;
            })
            .catch(() => {
              return true;
            });
        }
        return true;
      }
      return null;
    })
    .then(data => {
      if (data) {
        return {
          _id: restauranteId,
          child: {
            _id: eNode._id,
            name: eNode.name,
            active: eNode.active,
            description: ePlatillo.description,
            price: ePlatillo.price,
            imagenPlatillo: ePlatillo.image
          }
        };
      }
      return null;
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(err => {
      if (image) {
        return cloudDelete(image)
          .then(() => {
            throw err;
          });
      } else {
        throw err;
      }
    })
    .catch(validationError(res));
  };

  if (req.file) {
    dUri.format(path.extname(req.file.originalname).toString(),
      req.file.buffer);
    return cloud(dUri.content, {
      width: 500, height: 500
    })
      .then(image => {
        if (image && image.public_id) {
          return editPromise(image.public_id);
        } else {
          return editPromise(null);
        }
      });
  }

  return editPromise(null);

  // return Platillo.findOne({
  //   where: {
  //     _id: platilloId
  //   }
  // })
  //   .then(handleEntityNotFound(res))
  //   .then(platillo => {
  //     if (platillo) {
  //       const platilloOriginal = _.cloneDeep(platillo);
  //       platillo.description = description || platilloOriginal.description;
  //       platillo.name = name || platilloOriginal.name;
  //       platillo.price = price || platilloOriginal.price;
  //       return MenuNodes.findOne({
  //         where: {
  //           _id: platilloId
  //         }
  //       })
  //         .then(node => {
  //           const nodeOriginal = _.cloneDeep(node);
  //           // node.name = name || nodeOriginal.name;
  //           node.editorId = req.user._id;
  //           node.active = active === undefined || active === null ?
  //             nodeOriginal.active : active;
  //           node.updatedAt = new Date();
  //           return platillo.validate()
  //             .catch(err => {
  //               validationErrors.errors =
  //                 validationErrors.errors.concat(err.errors);
  //               return;
  //             })
  //             .then(() => {
  //               return node.validate();
  //             })
  //             .catch(err => {
  //               validationErrors.errors =
  //                 validationErrors.errors.concat(err.errors);
  //               return;
  //             })
  //             .then(() => {
  //               if (validationErrors.errors.length > 0) {
  //                 throw validationErrors;
  //               }
  //
  //               if (req.file) {
  //                 dUri.format(
  //                   path.extname(req.file.originalname).toString(),
  //                   req.file.buffer);
  //
  //                 return cloud(dUri.content, {
  //                   width: 500, height: 500
  //                 });
  //               }
  //               return null;
  //             })
  //             .then(data => {
  //               if (data && data.public_id) {
  //                 let currentImage = platillo.image;
  //                 platillo.image = data.public_id;
  //                 if (currentImage !== '') {
  //                   cloudDelete(currentImage);
  //                 }
  //               }
  //               return node.save();
  //             })
  //             .then(() => {
  //               return platillo.save();
  //             })
  //             .then(() => {
  //               return {
  //                 _id: restauranteId,
  //                 child: {
  //                   _id: node._id,
  //                   name: node.name,
  //                   active: node.active,
  //                   description: platillo.description,
  //                   price: platillo.price,
  //                   imagenPlatillo: platillo.image
  //                 }
  //               };
  //             });
  //         });
  //     }
  //     return null;
  //   })
  //   .then(respondWithResult(res))
  //   .catch(validationError(res));
}

// PUT '/:restauranteId/:categoriaId/:platilloId/platillo/subir'
export function increaseDishPosition(req, res) {
  let { platilloId, categoriaId, restauranteId } = req.params;

  return sequelize.transaction(function(t) {
    return Restaurante.findOne({
      where: { _id: restauranteId },
      attributes: ['_id'],
      lock: t.LOCK.SHARE,
      transaction: t
    })
      .then(restaurante => {
        if (restaurante) {
          return Categoria.findOne({
            where: { _id: categoriaId },
            attributes: ['_id'],
            lock: t.LOCK.SHARE,
            transaction: t
          });
        }
        return null;
      })
      .then(categoria => {
        if (categoria) {
          return Platillo.findOne({
            where: { _id: platilloId },
            lock: t.LOCK.UPDATE,
            transaction: t
          });
        }
        return null;
      })
      .then(platillo => {
        if (platillo) {
          return sequelize.query(nodeCountQuery, {
            type: Sequelize.QueryTypes.SELECT,
            replacements: {
              depth: 1,
              parentNodeId: categoriaId
            },
            transaction: t
          })
          .then(count => {
            if (count[0].count === platillo.position) {
              res.status(204).end();
              return null;
            }
            return sequelize.query(
              increasePositionNodeQuery(Platillo.tableName), {
                type: Sequelize.QueryTypes.UPDATE,
                replacements: {
                  depth: 1,
                  parentNodeId: categoriaId,
                  nodePosition: platillo.position,
                  nodeId: platillo._id
                },
                transaction: t
              });
          });
        }
        return null;
      });
  })
  .then(data => {
    if (data) {
      return sequelize.query(
        getNodesPositionQuery(Platillo.tableName), {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            depth: 1,
            parentNodeId: categoriaId
          }
        }
      );
    }
    return null;
  })
  .then(handleEntityNotFound(res))
  .then(respondWithResult(res))
  .catch(validationError(res));
}

// export function increaseDishPosition(req, res) {
//   let { platilloId, categoriaId } = req.params;
//
//   return Platillo.findOne({
//     where: {
//       _id: platilloId
//     }
//   })
//     .then(handleEntityNotFound(res))
//     .then(platillo => {
//       if (platillo) {
//         return sequelize.query(nodeCountQuery, {
//           type: Sequelize.QueryTypes.SELECT,
//           replacements: {
//             depth: 1,
//             parentNodeId: categoriaId
//           }
//         })
//           .then(count => {
//             if (count[0].count === platillo.position) {
//               res.status(204).end();
//               return null;
//             }
//             return sequelize.query(
//               increasePositionNodeQuery(Platillo.tableName), {
//                 type: Sequelize.QueryTypes.UPDATE,
//                 replacements: {
//                   depth: 1,
//                   parentNodeId: categoriaId,
//                   nodePosition: platillo.position,
//                   nodeId: platillo._id
//                 }
//               });
//           });
//       }
//       return null;
//     })
//     .then(data => {
//       if (data) {
//         return sequelize.query(
//           getNodesPositionQuery(Platillo.tableName), {
//             type: Sequelize.QueryTypes.SELECT,
//             replacements: {
//               depth: 1,
//               parentNodeId: categoriaId
//             }
//           }
//         );
//       }
//       return null;
//     })
//     .then(respondWithResult(res))
//     .catch(validationError(res));
// }

// PUT '/:restauranteId/:platilloId/platillo/bajar'
export function decreaseDishPosition(req, res) {
  let { platilloId, categoriaId, restauranteId } = req.params;

  return sequelize.transaction(function(t) {
    return Restaurante.findOne({
      where: { _id: restauranteId },
      attributes: ['_id'],
      lock: t.LOCK.SHARE,
      transaction: t
    })
      .then(restaurante => {
        if (restaurante) {
          return Categoria.findOne({
            where: { _id: categoriaId },
            attributes: ['_id'],
            lock: t.LOCK.SHARE,
            transaction: t
          });
        }
        return null;
      })
      .then(categoria => {
        if (categoria) {
          return Platillo.findOne({
            where: { _id: platilloId },
            lock: t.LOCK.UPDATE,
            transaction: t
          });
        }
        return null;
      })
      .then(platillo => {
        if (platillo) {
          if (platillo.position === 1) {
            res.status(204).end();
            return null;
          }
          return sequelize.query(
            decreasePositionNodeQuery(Platillo.tableName), {
              type: Sequelize.QueryTypes.UPDATE,
              replacements: {
                depth: 1,
                parentNodeId: categoriaId,
                nodePosition: platillo.position,
                nodeId: platillo._id
              },
              transaction: t
            });
        }
        return null;
      });
  })
  .then(data => {
    if (data) {
      return sequelize.query(
        getNodesPositionQuery(Platillo.tableName), {
          type: Sequelize.QueryTypes.SELECT,
          replacements: {
            depth: 1,
            parentNodeId: categoriaId
          }
        }
      );
    }
    return null;
  })
  .then(handleEntityNotFound(res))
  .then(respondWithResult(res))
  .catch(validationError(res));

  // return Platillo.findOne({
  //   where: {
  //     _id: platilloId
  //   }
  // })
  //   .then(handleEntityNotFound(res))
  //   .then(platillo => {
  //     if (platillo) {
  //       if (platillo.position === 1) {
  //         res.status(204).end();
  //         return null;
  //       }
  //       return sequelize.query(
  //         decreasePositionNodeQuery(Platillo.tableName), {
  //           type: Sequelize.QueryTypes.UPDATE,
  //           replacements: {
  //             depth: 1,
  //             parentNodeId: categoriaId,
  //             nodePosition: platillo.position,
  //             nodeId: platillo._id
  //           }
  //         });
  //     }
  //     return null;
  //   })
  //   .then(data => {
  //     if (data) {
  //       return sequelize.query(
  //         getNodesPositionQuery(Platillo.tableName), {
  //           type: Sequelize.QueryTypes.SELECT,
  //           replacements: {
  //             depth: 1,
  //             parentNodeId: categoriaId
  //           }
  //         }
  //       );
  //     }
  //     return null;
  //   })
  //   .then(respondWithResult(res))
  //   .catch(validationError(res));
}

// PUT '/:restauranteId/:categoriaId/:platilloId/platillo/mover/:destinoId'
// restauranteId: Id del restaurante al que pertenecen tanto el platillo como
//  la categoria a la que se va a mover
// categoriaId: Id de la categoria a la que pertence el platillo antes de mover
// platillodId: Id del platillo a mover
// destinoId: Id de la categoria a la que se movera el platillo,
//  debe de existir.
// export function moveDish(req, res) {
//   let { platilloId, categoriaId, restauranteId, destinoId } = req.params;
//
//   const errors = [];
//
//   if (isNaN(platilloId) || (platilloId ^ 0) !== +platilloId) {
//     errors.push({
//       message: 'El identificador del platillo no es válido',
//       type: 'Validation error',
//       path: 'platilloId',
//       value: platilloId,
//       raw: {}
//     });
//   }
//
//   if (isNaN(categoriaId) || (categoriaId ^ 0) !== +categoriaId) {
//     errors.push({
//       message: 'El identificador de la categoria no es válido',
//       type: 'Validation error',
//       path: 'categoriaId',
//       value: categoriaId,
//       raw: {}
//     });
//   }
//
//   if (isNaN(restauranteId) || (restauranteId ^ 0) !== +restauranteId) {
//     errors.push({
//       message: 'El identificador del restaurante no es válido',
//       type: 'Validation error',
//       path: 'restauranteId',
//       value: restauranteId,
//       raw: {}
//     });
//   }
//
//   if (isNaN(destinoId) || (destinoId ^ 0) !== +destinoId) {
//     errors.push({
//       message: 'El identificador de la categoria destino no es válido',
//       type: 'Validation error',
//       path: 'destinoId',
//       value: destinoId,
//       raw: {}
//     });
//   }
//
//   destinoId = +destinoId;
//   categoriaId = +categoriaId;
//   platilloId = +platilloId;
//   restauranteId = +restauranteId;
//
//   if (errors.length > 0) {
//     return res.status(400).send(errors);
//   }
//
//   return Platillo.findOne({
//     where: {
//       _id: platilloId
//     }
//   })
//     .then(handleEntityNotFound(res))
//     .then(platillo => {
//       if (platillo) {
//         return sequelize.query(disconnectSubtreeQuery, {
//           type: Sequelize.QueryTypes.DELETE,
//           replacements: {
//             movedNodeId: platillo._id
//           }
//         })
//         .then(() => {
//           return sequelize.query(updatePositionDeleteNodeQuery(
//             Platillo.tableName
//           ), {
//             type: Sequelize.QueryTypes.UPDATE,
//             replacements: {
//               depth: 1,
//               parentNodeId: categoriaId,
//               deletedNodePosition: platillo.position
//             }
//           });
//         })
//         .then(() => {
//           return sequelize.query(nodeCountQuery, {
//             type: Sequelize.QueryTypes.SELECT,
//             replacements: {
//               parentNodeId: destinoId,
//               depth: 1
//             }
//           });
//         })
//         .then(count => {
//           if (count) {
//             platillo.position = count[0].count + 1;
//             return platillo.save();
//           }
//         })
//         .then(() => {
//           return sequelize.query(connectSubtreeQuery, {
//             type: Sequelize.QueryTypes.INSERT,
//             replacements: {
//               parentNodeId: destinoId,
//               movedNodeId: platillo._id
//             }
//           });
//         })
//         .then(() => {
//           return sequelize.query(
//             getNodesPositionQuery(Platillo.tableName), {
//               type: Sequelize.QueryTypes.SELECT,
//               replacements: {
//                 depth: 1,
//                 parentNodeId: destinoId
//               }
//             }
//           );
//         });
//       }
//       return null;
//     })
//     .then(respondWithResult(res))
//     .catch(validationError(res));
// }

// DELETE '/:restauranteId/:categoriaId/:platilloId/platillo'
export function destroyDish(req, res) {
  let { platilloId, categoriaId, restauranteId } = req.params;
  let currentImage = null;
  let original;

  return sequelize.transaction(function(t) {
    return Restaurante.findOne({
      where: { _id: restauranteId },
      attributes: ['_id'],
      lock: t.LOCK.SHARE,
      transaction: t
    })
      .then(restaurante => {
        if (restaurante) {
          return Categoria.findOne({
            where: { _id: categoriaId },
            attributes: ['_id'],
            lock: t.LOCK.SHARE,
            transaction: t
          });
        }
        return null;
      })
      .then(categoria => {
        if (categoria) {
          return Platillo.findOne({
            where: { _id: platilloId },
            lock: t.LOCK.UPDATE,
            transaction: t
          });
        }
        return null;
      })
      .then(entity => {
        if (entity) {
          original = _.cloneDeep(entity);
          currentImage = entity.image;
          return sequelize.query(deleteLeafAndDescendantsQuery, {
            type: Sequelize.QueryTypes.DELETE,
            replacements: {
              deletedNodeId: entity._id
            },
            transaction: t
          })
            .then(() => {
              return sequelize.query(updatePositionDeleteNodeQuery(
                Platillo.tableName
              ), {
                type: Sequelize.QueryTypes.UPDATE,
                replacements: {
                  depth: 1,
                  parentNodeId: categoriaId,
                  deletedNodePosition: entity._id
                },
                transaction: t
              });
            });
        }
        return null;
      });
  })
    .then(entity => {
      if (entity) {
        if (currentImage !== '') {
          return cloudDelete(currentImage)
            .then(() => {
              return original;
            })
            .catch(() => {
              return original;
            });
        }
        return original;
      }
      return null;
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));

  // return Platillo.findOne({
  //   where: {
  //     _id: platilloId
  //   }
  // })
  //   .then(handleEntityNotFound(res))
  //   .then(entity => {
  //     if (entity) {
  //       let original = _.cloneDeep(entity);
  //       if (entity.image !== '') {
  //         cloudDelete(entity.image);
  //       }
  //       return sequelize.query(deleteLeafAndDescendantsQuery, {
  //         type: Sequelize.QueryTypes.DELETE,
  //         replacements: {
  //           deletedNodeId: original._id
  //         }
  //       })
  //         .then(() => {
  //           return sequelize.query(updatePositionDeleteNodeQuery(
  //             Platillo.tableName
  //           ), {
  //             type: Sequelize.QueryTypes.UPDATE,
  //             replacements: {
  //               depth: 1,
  //               parentNodeId: categoriaId,
  //               deletedNodePosition: original.position
  //             }
  //           })
  //           .then(() => original);
  //         });
  //     }
  //     return null;
  //   })
  //   .then(respondWithResult(res))
  //   .catch(handleError(res));
}

export function getLikes(req, res) {
  let { _id } = req.user;

  return sequelize.query(indexLikeQuery, {
    replacements: { userId: _id },
    type: Sequelize.QueryTypes.SELECT
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function getLike(req, res) {
  let { restauranteId } = req.params;
  let { _id } = req.user;

  Restaurante.findOne({
    where: { _id: restauranteId }
  })
    .then(entity => {
      if (entity) {
        return MenuLikes.findOne({
          where: {
            restauranteId,
            userId: _id
          }
        })
        .then(like => {
          if (like) {
            return {
              restauranteId,
              userId: _id,
              like: true
            };
          }
          return {
            restauranteId,
            userId: _id,
            like: false
          };
        });
      }
      return null;
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function likeRestaurant(req, res) {
  let { restauranteId } = req.params;
  let { _id } = req.user;

  MenuLikes.findOne({
    where: {
      restauranteId,
      userId: _id
    }
  })
    .then(entity => {
      if (entity) {
        res.status(400).send();
        return null;
      }
      return sequelize.transaction(function(t) {
        return sequelize.Promise.all([
          MenuLikes.create({
            restauranteId,
            userId: _id
          }, { transaction: t }),
          Restaurante.update({
            likes: sequelize.literal('likes + 1')
          }, {
            where: { _id: restauranteId },
            transaction: t
          })
        ]);
      });
    })
    .then(t => {
      if (t) {
        return {
          restauranteId,
          userId: _id
        };
      }
      return null;
    })
    .then(respondWithResult(res))
    .catch(validationError(res));
}

export function unlikeRestaurant(req, res) {
  let { restauranteId } = req.params;
  let { _id } = req.user;

  MenuLikes.findOne({
    where: {
      restauranteId,
      userId: _id
    }
  })
    .then(entity => {
      if (!entity) {
        res.status(400).send();
        return null;
      }
      return sequelize.transaction(function(t) {
        return sequelize.Promise.all([
          MenuLikes.destroy({
            where: {
              restauranteId,
              userId: _id
            },
            transaction: t
          }),
          Restaurante.update({
            likes: sequelize.literal('likes - 1')
          }, {
            where: { _id: restauranteId },
            transaction: t
          })
        ]);
      });
    })
    .then(t => {
      if (t) {
        return {
          restauranteId,
          userId: _id
        };
      }
      return null;
    })
    .then(respondWithResult(res))
    .catch(validationError(res));
}
