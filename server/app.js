'use strict';

/*eslint-env node*/
import express from 'express';
import sqldb from './sqldb';
import config from './config/environment';
import http from 'http';

const app = express();
const server = http.createServer(app);
const env = process.env.NODE_ENV || 'development';
console.log('environment', env);

if (env === 'production') {
  app.get('*.js', (req, res, next) => {
    req.url = req.url + '.gz';
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'text/javascript');
    next();
  });
  app.get('*.css', (req, res, next) => {
    req.url = req.url + '.gz';
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'text/css');
    next();
  });
}

require('./config/express').default(app);
require('./routes').default(app);

function startServer() {
  server.listen(config.port, () => {
    console.log(`Express server is listening on ${config.port}`);
  });
}

sqldb.sequelize.sync()
  .then(startServer)
  .catch(err => {
    console.log(`Server failed to start due to error: ${err}`);
  });

exports = module.exports = app;
