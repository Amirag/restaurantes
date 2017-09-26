'use strict';

/*eslint-env node*/

import { Estado, Ciudad, Sequelize, sequelize } from '../../sqldb';
import {
  handleError,
  validationError,
  respondWithResult,
  handleEntityNotFound
} from '../../helper';

const indexQuery = `SELECT
  _id, name AS state
FROM \`${Estado.tableName}\`
WHERE deletedAt IS NULL
ORDER BY name;`;

const deleteQuery =
`UPDATE \`${Estado.tableName}\`
SET deletedAt = NOW()
WHERE _id = :id AND deletedAt IS NULL;
UPDATE \`${Ciudad.tableName}\`
SET deletedAt = NOW()
WHERE stateId = :id AND deletedAt IS NULL`;

export function index(req, res) {
  sequelize.query(indexQuery, {
    type: Sequelize.QueryTypes.SELECT
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function create(req, res) {
  Reflect.deleteProperty(req.body, 'createdAt');
  Reflect.deleteProperty(req.body, 'deletedAt');

  req.body.authorId = req.user._id;

  Estado.build(req.body)
    .save()
    .then(function(estado) {
      return res.status(201).send(estado);
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

  //const deletedAt = new Date();

  return Estado.find({
    where: {
      _id: id,
      deletedAt: null
    }
  })
    .then(handleEntityNotFound(res))
    .then(entity => {
      if (entity) {
        return sequelize.query(deleteQuery, {
          replacements: { id },
          type: Sequelize.QueryTypes.UPDATE
        })
        // const original = _.cloneDeep(entity);
        // return entity.update({
        //   deletedAt
        // })
          .then(() => entity);
      }
      return null;
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}
