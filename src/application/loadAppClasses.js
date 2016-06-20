'use strict';

import path from 'path';
import fs from 'fs-extra';

import Controller from './core/controller';

function loadControllers(app) {
  global['Controller'] = Controller;
  const base = path.join(app.appPath, 'controllers', 'BaseController.js');
  if (_.fileExists(base)) {
    global['BaseController'] = require(base);
  }

  const otherbases = _.requireAll({
    dirname : path.join(app.appPath, 'controllers'),
    filter : /(.+BaseController)\.js$/
  });  

  _.forEach(otherbases, (obj, namespace) => {
    let name = `${namespace.capitalize()}BaseController`;
    global[name] = obj[name];
  });

  const controllers = _.requireAll({
    dirname : path.join(app.appPath, 'controllers'),
    filter : /(.+Controller)\.js$/
  });

  _.forEach(controllers, (cls, name) => {
    if (!global[name]) {
      global[name] = cls;
    }
  });
}

function loadServices(app) {
  const services = _.requireAll({
    dirname : path.join(app.appPath, 'services'),
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
  const helpers = _.requireAll({
    dirname : path.join(app.appPath, 'helpers'),
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

function loadUtils(app) {
  const _utils = _.requireAll({
    dirname : path.join(app.appPath, 'utils'),
    filter : /(.+)\.js$/
  });

  _.forEach(_utils, (util, name) => {
    _[name] = util;
  });
}

export default function loadAppClasses(app) {
  fs.ensureDirSync(path.join(app.appPath, 'controllers'));
  fs.ensureDirSync(path.join(app.appPath, 'services'));
  fs.ensureDirSync(path.join(app.appPath, 'helpers'));
  fs.ensureDirSync(path.join(app.appPath, 'utils'));

  loadControllers(app);
  loadServices(app);
  loadHelpers(app);
  loadUtils(app);

  app.debug('load application classes');
};