'use strict';

/*eslint-env node*/
/*eslint max-len: ["error", { "ignoreTemplateLiterals": true }]*/

import _ from 'lodash';
import { User, NewUser, Sequelize, sequelize } from '../../sqldb';
// import config from '../../config/environment';
// import { signToken } from '../../auth/auth.service';
import {
  handleError,
  validationError,
  respondWithResult,
  handleEntityNotFound
} from '../../helper';

import mailer from '../../mailer';
import config from '../../config/environment';

const indexQuery = `SELECT
  _id, email, role, provider, IF(deletedAt IS NULL, FALSE, TRUE) AS deleted
FROM ${User.tableName};`;

const showQuery = `SELECT
  _id, email, role, provider, createdAt, updatedAt, deletedAt
FROM ${User.tableName}
WHERE _id = :id AND deletedAt IS NULL;`;

const meQuery = `SELECT
  _id, email, role, provider
FROM ${User.tableName}
WHERE _id = :id AND deletedAt IS NULL;`;

export function index(req, res) {
  sequelize.query(indexQuery, {
    type: Sequelize.QueryTypes.SELECT
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function create(req, res) {
  const newUser = NewUser.build(req.body);
  newUser.setDataValue('provider', 'local');
  newUser.setDataValue('role', 'usuario');
  return newUser.save()
    .then(function() {
      return res.status(201).end();
    })
    .then(user => {
      let mailOptions = {
        from: config.smtp.from,
        to: user.email,
        subject: 'Mis Restaurantes: nueva cuenta',
        text:
`¡Te damos la bienvenida a Mis Restaurantes!

Para completar tu registro sólo es necesario que entres al siguiente vínculo:
http://localhost:8080/nuevo?usuario=${user._id}

Si tienes problemas para entrar al vínculo, copialo y pégalo en la barra de búsqueda del navegador

Si no te registraste en Mis Restaurantes, ignora este correo. El código de activación caduca en 24 horas`
      };
      return mailer(mailOptions);
    })
    .catch(validationError(res));
}

export function activate(req, res) {
  if (!req.query || !req.query.usuario) {
    res.status(400).end();
    return;
  }

  return sequelize.transaction(function(t) {
    return NewUser.findOne({
      where: {
        _id: req.query.usuario,
        createdAt: {
          $gte: sequelize.literal('DATE_SUB(NOW(), INTERVAL 1 DAY)')
        },
        usedAt: null
      },
      lock: t.LOCK.UPDATE,
      transaction: t
    })
    .then(newUser => {
      if (newUser) {
        return User.create({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          password: newUser.password,
          provider: newUser.provider,
          salt: newUser.salt,
          address1: newUser.address1,
          address2: newUser.address2,
          city: newUser.city,
          state: newUser.state,
          postalCode: newUser.postalCode
        }, {
          transaction: t
        })
        .then(user => {
          return newUser.update({
            usedAt: sequelize.literal('NOW()')
          }, {
            transaction: t
          });
        });
      }
      return null;
    });
  })
  .then(handleEntityNotFound(res))
  .then(user => {
    if (user) {
      return res.status(201).end();
    }
    return null;
  })
  .catch(handleError(res));
}

export function show(req, res) {
  const { id } = req.params;

  sequelize.query(showQuery, {
    replacements: { id },
    type: Sequelize.QueryTypes.SELECT
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function destroy(req, res) {
  const { id } = req.params;

  const deletedAt = new Date();

  return User.findOne({
    where: {
      _id: id,
      deletedAt: null
    }
  })
    .then(handleEntityNotFound(res))
    .then(entity => {
      if (entity) {
        if (entity.role === 'admin') {
          res.status(403).send([{
            message: `No es posible desactivar un usuario administrador`,
            type: 'Authorization error',
            path: 'role',
            value: 'admin',
            raw: {}
          }]);
          return null;
        }
        const original = _.cloneDeep(entity);
        return entity.update({
          editorId: req.user._id,
          deletedAt
        })
            .then(() => original);
      }
      return null;
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function revive(req, res) {
  const { id } = req.params;

  return User.findOne({
    where: {
      _id: id,
      deletedAt: {
        $ne: null
      }
    }
  })
    .then(handleEntityNotFound(res))
    .then(entity => {
      if (entity) {
        const original = _.cloneDeep(entity);
        return entity.update({
          editorId: req.user._id,
          deletedAt: null
        })
            .then(() => original);
      }
      return null;
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function updateRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  return User.findOne({
    where: {
      _id: id,
      deletedAt: null
    }
  })
    .then(handleEntityNotFound(res))
    .then(entity => {
      if (entity) {
        entity.role = role;
        return entity.save();
      }
      return null;
    })
    .then(entity => {
      if (entity) {
        return {
          _id: entity._id,
          email: entity.email,
          provider: entity.provider,
          role: entity.role,
          deleted: entity.deletedAt !== null
        };
      }
      return null;
    })
    .then(respondWithResult(res, 200))
    .catch(validationError(res));
}

export function settings(req, res) {
  const { _id } = req.user;
  const oldPassword = String(req.body.password);
  const newPassword = String(req.body.newPassword);

  const updatedAt = new Date();

  return User.findOne({
    where: {
      //_id,
      email: req.body.email,
      deletedAt: null
    }
  })
    .then(handleEntityNotFound(res))
    .then(entity => {
      if (entity) {
        if (entity.authenticate(oldPassword)) {
          return entity;
        }
        res.status(403).end();
        return null;
      }
      return null;
    })
    .then(entity => {
      if (entity) {
        const original = _.cloneDeep(entity);
        return entity.update({
          name: req.body.name || original.name,
          //email: req.body.email || original.email,
          password: newPassword || original.password,
          address1: req.body.address1 || original.address1,
          address2: req.body.address2 || original.address2,
          city: req.body.city || original.city,
          state: req.body.state || original.state,
          postalCode: req.body.postalCode || original.postalCode,
          editorId: _id,
          createdAt: original.createdAt,
          updatedAt,
          deletedAt: original.deletedAt
        })
          // .then(function() {
          //   return UserHistory.create({
          //     userId: original._id,
          //     name: original.name,
          //     email: original.email,
          //     role: original.role,
          //     password: original.password,
          //     provider: original.provider,
          //     salt: original.salt,
          //     address1: original.address1,
          //     address2: original.address2,
          //     city: original.city,
          //     state: original.state,
          //     postalCode: original.postalCode,
          //     editorId: original.editorId,
          //     createdAt: original.createdAt,
          //     updatedAt: original.updatedAt,
          //     deletedAt: original.deletedAt
          //   });
          // })
          .then(() => {
            return { email: original.email };
          });
      }
      return null;
    })
    .then(respondWithResult(res))
    .then(validationError(res));
}

export function me(req, res) {
  const { _id } = req.user;
  return sequelize.query(meQuery, {
    replacements: { id: _id },
    type: Sequelize.QueryTypes.SELECT
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function authCallback(req, res) {
  res.redirect('/');
}
