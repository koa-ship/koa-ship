'use strict';

import path from 'path';
import fs from 'fs-extra';
import debug from 'debug';

import Koa from 'koa';
import Router from './core/router';

import exposeGlobals from './exposeGlobals';
import formatEnv from './formatEnv';
import loadConfigs from './loadConfigs';
import loadMiddlewares from './loadMiddlewares';
import loadAppClasses from './loadAppClasses';

export default class Application {

  constructor(rootPath, frameworkPath = null) {
    this.debug = debug('koa-ship');

    this.setDirs(rootPath, frameworkPath);

    this.env = this.loadEnv();
    this.globals = {};
    this.configs = {};
    this.middlewares = [];

    this.server = new Koa();
  }

  setDirs(rootPath, frameworkPath) {
    this.rootPath = rootPath;

    if (frameworkPath == null) {
      frameworkPath = path.dirname(path.dirname(__dirname));
    }

    this.frameworkPath = frameworkPath;
    this.npmBinPath = path.join(this.rootPath, 'node_modules', '.bin');
  }

  loadEnv() {
    let env = 'production';

    // read env from env.js file
    const envfile = path.join(this.rootPath, 'env.js');
    if (!fs.existsSync(envfile)) {
      return env;
    }

    env = require(envfile);

    // NODE_ENV will overwrite env
    env = process.env.NODE_ENV || env;

    return formatEnv(env);
  }

  set(name, object) {
    this.globals[name] = object;
  }

  get(name) {
    return this.globals[name];
  }

  prepare() {
    require('./extendNodeFeatures');
    exposeGlobals(this);

    this.configs = loadConfigs(this.rootPath, this.env);

    this.configs.app = this.configs.app || { port: 3000 };
    this.server.name = this.configs.app.name || 'app';
    this.server.env = this.env;

    if (this.configs.app.keys) {
      this.server.keys = this.configs.app.keys;
    }
  }

  boot() {
    this.debug('app boot');
    this.prepare();
    this.middlewares = loadMiddlewares(this);
    loadAppClasses(this);
  }

  start() {
    this.debug('app start');

    let router = new Router(this);
    router.loadRules();

    this.server.listen(this.configs.app.port);
  }

  run(cb) {
    this.boot();
    this.start();

    if (typeof cb == 'function') {
      cb();
    }
  }

  abort(msg) {
    throw new Error(msg);
  }
}