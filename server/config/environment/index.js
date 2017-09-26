'use strict';

/*eslint-env node*/

import path from 'path';
import _ from 'lodash';

var all = {
  env: process.env.NODE_ENV || 'development',
  // root: path.normalize(`${__dirname}/../../..`),
  root: path.normalize(`${__dirname}/..`),
  port: process.env.PORT || 8080,
  secrets: {
    session: 'restaurantes-secret'
  },
  cloudinaryConfig: {
    cloud_name: 'ddx0osgaz',
    api_key: '726988736359978',
    api_secret: 'tsDzRid5j2ffcV_9bqdy9Cq4a_k'
  },
  // mantener el orden de los tipos de nodos, se utiliza para revisar
  // que los nombres de los restaurantes no se repitan
  tiposNodos: ['restaurante', 'categoria', 'platillo']
};

module.exports = _.merge(
  all,
  require('./shared'),
  require(`./${process.env.NODE_ENV}.js`) || {}
);
