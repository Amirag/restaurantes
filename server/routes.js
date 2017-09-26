'use strict';

/*eslint-env node*/
import path from 'path';
import express from 'express';

export default function(app) {
  app.use('/api/users', require('./api/user'));
  app.use('/api/restaurantes', require('./api/menu'));
  app.use('/api/ciudades', require('./api/ciudades'));
  app.use('/api/estados', require('./api/estados'));
  app.use('/auth', require('./auth').default);

  app.use('/static', express.static(path.join(__dirname, 'public')));

  console.log(path.join(__dirname, '/../favicons', 'favicon-32x32.png'));

  app.use('/manifest.json', express.static(
    path.join(__dirname, '/../favicons', 'manifest.json')
  ));
  app.use('/android-chrome-192x192.png', express.static(
    path.join(__dirname, '/../favicons', 'android-chrome-192x192.png')
  ));
  app.use('/android-chrome-256x256.png', express.static(
    path.join(__dirname, '/../favicons', 'android-chrome-256x256.png')
  ));
  app.use('/android-chrome-512x512.png', express.static(
    path.join(__dirname, '/../favicons', 'android-chrome-512x512.png')
  ));
  app.use('/apple-touch-icon.png', express.static(
    path.join(__dirname, '/../favicons', 'apple-touch-icon.png')
  ));
  app.use('/browserconfig.xml', express.static(
    path.join(__dirname, '/../favicons', 'browserconfig.xml')
  ));
  app.use('/favicon.ico', express.static(
    path.join(__dirname, '/../favicons', 'favicon.ico')
  ));
  app.use('/favicon-16x16.png', express.static(
    path.join(__dirname, '/../favicons', 'favicon-16x16.png')
  ));
  app.use('/favicon-32x32.png', express.static(
    path.join(__dirname, '/../favicons', 'favicon-32x32.png')
  ));
  app.use('/mstile-150x150.png', express.static(
    path.join(__dirname, '/../favicons', 'mstile-150x150.png')
  ));
  app.use('/safari-pinned-tab.svg', express.static(
    path.join(__dirname, '/../favicons', 'safari-pinned-tab.svg')
  ));

  app.route('/:url(api/auth/components/app/node_components/assets)/*')
    .get((req, res) => {
      return res.status(404).end();
    });

  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}
