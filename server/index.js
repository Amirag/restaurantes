'use strict';

/*eslint-env node*/
const env = process.env.NODE_ENV || 'development';

//if (env === 'development' || env === 'test' || env === 'production') {
require('babel-register');
//}

exports = module.exports = require('./app');
