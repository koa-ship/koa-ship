'use strict';

import path from 'path';
import fs from 'fs-extra';

import Controller from './core/controller';

function loadControllers(app) {
  const appPath = path.join(app.rootPath, 'app');

  global['Controller'] = Controller;
  const base = path.join(appPath, 'controllers', 'BaseController.js');
  if (fs.existsSync(base)) {
    global['BaseController'] = require(base);
  }

  const otherbases = _.requireAll({
    dirname : path.join(appPath, 'controllers'),
    filter : /(.+BaseController)\.js$/
  });  

  _.forEach(otherbases, (obj, namespace) => {
    let name = `${namespace.capitalize()}BaseController`;
    global[name] = obj[name];
  });

  const controllers = _.requireAll({
    dirname : path.join(appPath, 'controllers'),
    filter : /(.+Controller)\.js$/
  });

  _.forEach(controllers, (cls, name) => {
    if (!global[name]) {
      global[name] = cls;
    }
  });
}

function loadServices(app) {
  const appPath = path.join(app.rootPath, 'app');

  const services = _.requireAll({
    dirname : path.join(appPath, 'services'),
    filter : /(.+Service)\.js$/
  });

  _.forEach(services, (service, sname) => {
    _.forEach(app.globals, (obj, name) => {
      service[name] = obj;
    });
    global[sname] = service;
  });
}

function loadHelpers(app) {
  const appPath = path.join(app.rootPath, 'app');

  const helpers = _.requireAll({
    dirname : path.join(appPath, 'helpers'),
    filter : /(.+Helper)\.js$/
  });

  // global['TagHelper'] = require('./helpers/tag');

  _.forEach(helpers, (helper, name) => {
    if (global[name] === undefined) {
      global[name] = {};
    }

    global[name] = _.merge(global[name], helper);
  });
}

export default function loadAppClasses(app) {
  const appPath = path.join(app.rootPath, 'app');

  fs.ensureDirSync(path.join(appPath, 'controllers'));
  fs.ensureDirSync(path.join(appPath, 'services'));
  fs.ensureDirSync(path.join(appPath, 'helpers'));

  loadControllers(app);
  loadServices(app);
  loadHelpers(app);

  app.debug('load application classes');
};