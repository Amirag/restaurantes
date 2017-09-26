'use strict';

/*eslint-env node*/

import { Ciudad, Estado, Sequelize, sequelize } from '../../sqldb';
import {
  handleError,
  validationError,
  respondWithResult,
  handleEntityNotFound
} from '../../helper';
import _ from 'lodash';

const indexQuery = `SELECT
  t1._id, t1.name AS city, t1.\`postal-code\`,
  t1.stateId, t2.name AS state
FROM \`${Ciudad.tableName}\` t1
LEFT JOIN \`${Estado.tableName}\` t2 ON t2._id = t1.stateId
WHERE t1.deletedAt IS NULL AND t2.deletedAt IS NULL
ORDER BY t1.name;`;

export function index(req, res) {
  return sequelize.query(indexQuery, {
    type: Sequelize.QueryTypes.SELECT
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function create(req, res) {
  Reflect.deleteProperty(req.body, 'createdAt');
  Reflect.deleteProperty(req.body, 'deletedAt');

  req.body.authorId = req.user._id;

  Ciudad.build(req.body)
    .save()
    .then(function(ciudad) {
      return res.status(201).send(ciudad);
    })
    .catch(validationError(res));
}

export function destroy(req, res) {
  const errors = [];
  const { id } = req.params;

  if (isNaN(id) || (id ^ 0) !== +id) {
    errors.push({
      message: 'El id no es válido',
      type: 'Validation error',
      path: 'id',
      value: id,
      raw: {}
    });
  }

  if (errors.length > 0) {
    return res.status(500).send(errors);
  }

  const deletedAt = new Date();

  return Ciudad.find({
    where: {
      _id: id,
      deletedAt: null
    }
  })
    .then(handleEntityNotFound(res))
    .then(entity => {
      if (entity) {
        const original = _.cloneDeep(entity);
        return entity.update({
          deletedAt
        })
          .then(() => original);
      }
      return null;
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}
