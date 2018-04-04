import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { renderModuleFactory } from '@angular/platform-server';
import { enableProdMode } from '@angular/core';
import { ngExpressEngine } from '@nguniversal/express-engine';

import * as express from 'express';
import { join } from 'path';
import { readFileSync } from 'fs';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();

const port = process.env.PORT || 4000;
const distFolder = join(process.cwd(), 'dist');

// Our index.html we'll use as our template
const template = readFileSync(
  join(distFolder, 'browser', 'index.html')
).toString();

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {
  AppServerModuleNgFactory,
  LAZY_MODULE_MAP
} = require('./dist/server/main.bundle');

const {
  provideModuleMap
} = require('@nguniversal/module-map-ngfactory-loader');

app.engine(
  'html',
  ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    providers: [provideModuleMap(LAZY_MODULE_MAP)]
  })
);

app.set('view engine', 'html');
app.set('views', join(distFolder, 'browser'));

// Server static files from /browser
app.get('*.*', express.static(join(distFolder, 'browser')));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render(join(distFolder, 'browser', 'index.html'), { req });
});

// Start up the Node server
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
