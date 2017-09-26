'use strict';

/*eslint-env node*/

import config from '../config/environment';
import sqldb from '../sqldb';
import cloudinary from 'cloudinary';

cloudinary.config(config.cloudinaryConfig);

export function validationError(res, statusCode = 422) {
  return function(err) {
    console.log(err);
    return res.status(statusCode).send(err);
  };
}

export function handleError(res, statusCode = 500) {
  return function(err) {
    console.log(err);
    return res.status(statusCode).send(err);
  };
}

export function respondWithResult(res, statusCode = 200) {
  return function(entity) {
    if (entity) {
      return res.status(statusCode).send(entity);
    }
    return null;
  };
}

export function handleEntityNotFound(res, statusCode = 404) {
  return function(entity) {
    if (!entity) {
      res.status(statusCode).end();
      return null;
    }
    return entity;
  };
}

export function pagination(query1, query2, replacements) {
  const data = {
    count: 0,
    data: []
  };

  return sqldb.sequelize.query(query1, {
    replacements,
    type: sqldb.Sequelize.QueryTypes.SELECT
  })
    .then(r => {
      if (r && r[0] && r[0].count) {
        data.count = r[0].count;
      }
      return sqldb.sequelize.query(query2, {
        replacements,
        type: sqldb.Sequelize.QueryTypes.SELECT
      });
    })
    .then(r => {
      data.data = r;
      return data;
    });
}

export function cloud(content, options) {
  return new Promise(function(resolve, reject) {
    cloudinary.uploader.upload(content, function(res, err) {
      if (err) {
        reject(err);
      }
      resolve(res);
    }, options);
  });
}

export function cloudDelete(publicId) {
  return new Promise(function(resolve, reject) {
    cloudinary.uploader.destroy(publicId, function(res, err) {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
}

export function checkIdFromParams(id) {
  return function(req, res, next) {
    if (!req._errors) {
      req._errors = [];
    }

    if (!req.params || !req.params[id]) {
      req._errors.push({
        message: `El identificador ${id} no fue encontrado`,
        type: 'Validation error',
        path: 'id',
        value: '',
        raw: {}
      });
      return next();
    }

    if (isNaN(req.params[id]) || (req.params[id] ^ 0) !== +req.params[id]) {
      req._errors.push({
        message: `El identificador ${id} no es válido`,
        type: 'Validation error',
        path: 'id',
        value: req.params[id],
        raw: {}
      });
    }

    req.params[id] = +req.params[id];

    return next();
  };
}

export function checkIfErrors(statusCode = 400) {
  return function(req, res, next) {
    if (req._errors && req._errors.length > 0) {
      return res.status(statusCode).send(req._errors);
    }
    return next();
  };
}
