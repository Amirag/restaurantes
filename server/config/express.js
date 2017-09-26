'use strict';

/*globals require*/
/*eslint-env node*/

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'cookie-session';
import path from 'path';
import morgan from 'morgan';
import helmet from 'helmet';
import csrf from 'csurf';
// const redisClient = require('redis').createClient();
// let limiter;

// import config from './environment';
const env = process.env.NODE_ENV || 'development';

export default function(app) {
  app.use(helmet());
  // limiter = require('express-limiter')(app, redisClient);
  // limiter({
  //   lookup: ['connection.remoteAddress'],
  //   total: 100,
  //   expire: 1000 * 60 * 60
  // });
  var expiryDate = new Date(Date.now() + 60 * 60 * 1000);
  app.use(session({
    name: 'session',
    keys: [
      '2043406112fa4534b785c428d6798f3f9de56fd71bdf4caf1cdc54ecb36f9784',
      '5e7cb2cf43f6368b86eed8ae072377d24cf48dc2700f0f24b577e9be4a3d72c8',
      '30004a2a8ee06c1f8df42f6a47fe87b551df458eef16497a8068bb0ff33abc12'
    ],
    cookie: {
      //secure: true,
      httpOnly: true,
      expires: expiryDate
    }
  }));
  app.set('appPath', path.resolve('dist'));
  app.use(express.static(app.get('appPath')));
  if (env !== 'production') {
    app.use(morgan('dev'));
  }
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(csrf({
    cookie: {
      sameSite: true,
      httpOnly: true
      //secure: true
    }
  }));
  app.use(function(req, res, next) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
  });
}
