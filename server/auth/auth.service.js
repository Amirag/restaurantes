'use strict';

/*eslint-env node*/

import config from '../config/environment';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import compose from 'composable-middleware';
import {
  User,
  MenuAdmin,
  Categoria,
  Restaurante,
  MenuPaths
} from '../sqldb';

const validateJwt = expressJwt({
  secret: config.secrets.session
});

export function getUserInfo() {
  return compose()
    .use(function(req, res, next) {
      if (typeof req.headers.authorization === 'undefined') {
        return next();
      } else {
        return validateJwt(req, res, next);
      }
    })
    .use(function(req, res, next) {
      if (req.user) {
        return User.findOne({
          where: {
            _id: req.user._id,
            deletedAt: null
          }
        })
          .then(user => {
            if (!user) {
              return res.status(401).end();
            }
            req.user = user;
            return next();
          })
          .catch(err => next(err));
      }
      return next();
    });
}

export function isMenuAdmin() {
  return compose()
    .use(function(req, res, next) {
      return validateJwt(req, res, next);
    })
    .use(function(req, res, next) {
      if (req.user) {
        return User.findOne({
          where: {
            _id: req.user._id,
            deletedAt: null
          }
        })
          .then(user => {
            if (!user) {
              return res.status(401).end();
            }
            req.user = user;
            return next();
          });
      }
    })
    .use(function(req, res, next) {
      let { restauranteId } = req.params;
      if (isNaN(restauranteId) || (restauranteId ^ 0) !== +restauranteId) {
        return res.status(400).end();
      }
      restauranteId = +restauranteId;
      if (!req.user || !req.user.role || !req.user._id) {
        return res.status(401).end();
      }
      if (req.user.role === 'admin') {
        return Restaurante.findOne({
          where: {
            _id: restauranteId
          }
        })
          .then(entity => {
            if (entity) {
              return next();
            }
            return res.status(401).end();
          })
          .catch(err => next(err));
      }

      return MenuAdmin.findOne({
        where: {
          userId: req.user._id,
          restauranteId
        }
      })
        .then(admin => {
          if (admin) {
            return next();
          }
          return res.status(401).end();
        })
        .catch(err => next(err));
    });
}

export function getUserMenuAdminStatus() {
  return function(req, res, next) {
    let { restauranteId } = req.params;

    if (!req.user) {
      return next();
    }

    if (isNaN(restauranteId) || (restauranteId ^ 0) !== +restauranteId) {
      return res.status(400).end();
    }

    restauranteId = +restauranteId;

    return Restaurante.findOne({
      where: {
        _id: restauranteId
      }
    })
      .then(entity => {
        if (entity) {
          if (req.user.role === 'admin') {
            req.user.menuAdmin = true;
            return next();
          }
          return MenuAdmin.find({
            where: {
              userId: req.user._id,
              restauranteId
            }
          })
          .then(entity => {
            if (entity) {
              req.user.menuAdmin = true;
              return next();
            }
            req.user.menuAdmin = false;
            return next();
          })
          .catch(err => next(err));
        }
        return res.status(404).end();
      });
  };
}

export function getUserRestuarantAdminStatus() {
  return function(req, res, next) {
    let { restaurante } = req.params;

    restaurante = decodeURI(restaurante).replace(/_/g, ' ');

    if (!req.user) {
      return next();
    }

    return Restaurante.findOne({
      where: {
        name: restaurante
      }
    })
      .then(entity => {
        if (entity) {
          if (req.user.role === 'admin') {
            req.user.menuAdmin = true;
            return next();
          }
          return MenuAdmin.find({
            where: {
              userId: req.user._id,
              restauranteId: entity._id
            }
          })
          .then(entity => {
            if (entity) {
              req.user.menuAdmin = true;
              return next();
            }
            req.user.menuAdmin = false;
            return next();
          })
          .catch(err => next(err));
        }
        return res.status(404).end();
      });
  };
}

export function nodeBelongsToRestaurant() {
  return function(req, res, next) {
    let { restauranteId, categoriaId, platilloId } = req.params;
    let nodeId = 0;
    let depth = 0;
    if (isNaN(restauranteId) || (restauranteId ^ 0) !== +restauranteId) {
      return res.status(400).end();
    }

    if (!categoriaId && !platilloId) {
      return res.status(400).end();
    }

    if (categoriaId &&
      (isNaN(categoriaId) || (categoriaId ^ 0) !== +categoriaId)) {
      return res.status(400).end();
    }
    if (platilloId &&
      (isNaN(platilloId) || (platilloId ^ 0) !== +platilloId)) {
      return res.status(400).end();
    }
    restauranteId = +restauranteId;
    if (platilloId) {
      nodeId = +platilloId;
      depth = 2;
    } else {
      nodeId = +categoriaId;
      depth = 1;
    }


    return Restaurante.findOne({
      where: {
        _id: restauranteId
      }
    })
      .then(entity => {
        if (entity) {
          return MenuPaths.findOne({
            where: {
              parent: restauranteId,
              descendant: nodeId,
              depth
            }
          });
        }
        res.status(404).end();
        return null;
      })
      .then(entity => {
        if (entity) {
          return next();
        }
        return res.status(401).end();
      })
      .catch(err => next(err));
  };
}

export function nodeBelongsToCategory() {
  return function(req, res, next) {
    let { categoriaId, platilloId } = req.params;

    const errors = [];

    if (isNaN(categoriaId) || (categoriaId ^ 0) !== +categoriaId) {
      errors.push({
        message: 'El identificador de la categoria no es válido',
        type: 'Validation error',
        path: 'categoriaId',
        value: categoriaId,
        raw: {}
      });
    }

    if (isNaN(platilloId) || (platilloId ^ 0) !== +platilloId) {
      errors.push({
        message: 'El identificador del platillo no es válido',
        type: 'Validation error',
        path: 'platilloId',
        value: platilloId,
        raw: {}
      });
    }

    platilloId = +platilloId;
    categoriaId = +categoriaId;

    if (errors.length > 0) {
      return res.status(400).send(errors);
    }

    return Categoria.findOne({
      where: {
        _id: categoriaId
      }
    })
      .then(entity => {
        if (entity) {
          return MenuPaths.findOne({
            where: {
              parent: categoriaId,
              descendant: platilloId,
              depth: 1
            }
          });
        }
        res.status(404).end();
        return null;
      })
      .then(entity => {
        if (entity) {
          return next();
        }
        return res.status(401).end();
      })
      .catch(err => next(err));
  };
}

export function destinationBelongsToRestaurant() {
  return function(req, res, next) {
    let { restauranteId, destinoId } = req.params;

    const errors = [];

    if (isNaN(restauranteId) || (restauranteId ^ 0) !== +restauranteId) {
      errors.push({
        message: 'El identificador del restaurante no es válido',
        type: 'Validation error',
        path: 'restauranteId',
        value: restauranteId,
        raw: {}
      });
    }

    if (isNaN(destinoId) || (destinoId ^ 0) !== +destinoId) {
      errors.push({
        message: 'El identificador de la categoria destino no es válido',
        type: 'Validation error',
        path: 'destinoId',
        value: destinoId,
        raw: {}
      });
    }

    destinoId = +destinoId;
    restauranteId = +restauranteId;

    if (errors.length > 0) {
      return res.status(400).send(errors);
    }

    return Restaurante.findOne({
      where: {
        _id: restauranteId
      }
    })
      .then(entity => {
        if (entity) {
          return MenuPaths.findOne({
            where: {
              parent: restauranteId,
              descendant: destinoId,
              depth: 1
            }
          });
        }
        res.status(404).end();
        return null;
      })
      .then(entity => {
        if (entity) {
          return next();
        }
        return res.status(401).end();
      })
      .catch(err => next(err));
  };
}

export function isAuthenticated() {
  return compose()
    .use(function(req, res, next) {
      /*
      if (req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = `Bearer ${req.query.acess_token}`;
      }

      if (req.query && typeof req.headers.authorization === 'undefined') {
        req.headers.authorization = `Bearer ${req.cookies.token}`;
      }
      */
      validateJwt(req, res, next);
    })
    .use(function(req, res, next) {
      return User.findOne({
        where: {
          _id: req.user._id,
          deletedAt: null
        }
      })
        .then(user => {
          if (!user) {
            return res.status(401).end();
          }
          req.user = user;
          return next();
        })
        .catch(err => next(err));
    });
}

export function hasRole(roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      const userIndex = config.roles.indexOf(req.user.role);
      const requiredIndex = config.roles.indexOf(roleRequired);
      if (userIndex !== -1 &&
        requiredIndex !== -1 &&
        userIndex >= requiredIndex) {
        return next();
      } else {
        return res.status(403).send('Forbidden');
      }
    });
}

export function signToken(id, role) {
  return jwt.sign({ _id: id, role }, config.secrets.session, {
    expiresIn: 60 * 60 * 24 * 30
  });
}

export function setTokenCookie(req, res) {
  if (!req.user) {
    return res.status(404)
      .send('No se ha iniciado sesión, favor de intentarlo nuevamente.');
  }
  const token = signToken(req.user._id, req.user.role);
  res.cookie('token', token);
  res.redirect('/');
}
