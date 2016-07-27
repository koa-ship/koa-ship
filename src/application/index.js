'use strict';

import path from 'path';
import fs from 'fs-extra';
import debug from 'debug';
import repl from 'ks-repl';

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
    this.appPath = path.join(this.rootPath, 'app');
    this.tmpPath = path.join(this.rootPath, 'tmp');
    this.dataPath = path.join(this.rootPath, 'data');

    fs.ensureDirSync(this.appPath);
    fs.ensureDirSync(this.tmpPath);
    fs.ensureDirSync(this.dataPath);

    if (frameworkPath == null) {
      frameworkPath = path.dirname(path.dirname(__dirname));
    }

    this.frameworkPath = frameworkPath;
    this.npmBinPath = path.join(this.rootPath, 'node_modules', '.bin');
  }

  loadEnv() {
    let env;

    // read env from env.js file
    const envfile = path.join(this.rootPath, 'env.js');
    try {
      env = require(envfile);
    } catch(e) {
      env = 'production';
    }

    // NODE_ENV will overwrite env
    env = process.env.NODE_ENV || env;

    return formatEnv(env);
  }

  setEnv(env) {
    this.env = formatEnv(env);
  }

  setTestEnv() {
    this.setEnv('test');
  }

  loadConfigs() {
    this.configs = loadConfigs(this.rootPath, this.env);
    this.name = this.configs.app.name;

    this.server.name = this.configs.app.name;
    this.server.env = this.env;

    if (this.configs.app.keys) {
      this.server.keys = this.configs.app.keys;
    }
  }

  prepare() {
    require('./extendNodeFeatures');
    exposeGlobals(this);
    this.loadConfigs();
  }

  boot() {
    this.debug('app boot');

    this.prepare();

    loadAppClasses(this);
    loadMiddlewares(this);
  }

  startServer(cb) {
    const self = this;
    this.debug('app start');

    let router = new Router(this);
    router.loadRules(function(err) {
      if (err) {
        return self.abort(err);
      }

      let port = self.configs.app.port;
      self.debug(`listening on port ${port}`);
      self.server.listen(port);
      cb();
    });
  }

  startRepl() {
    global['utils'] = _;

    repl({
      cli: path.join(this.appPath, 'cli'),
      history: path.join(this.dataPath, 'repl.log')
    });
  }

  run(cb) {
    this.boot();

    if (process.argv.indexOf('--repl') != -1) {
      this.startRepl();
    } else {
      this.startServer(function() {
        if (typeof cb == 'function') cb();
      });
    }
  }

  set(name, object) {
    this.globals[name] = object;
  }

  get(name) {
    return this.globals[name];
  }

  middlewareIsLoad(name) {
    return _.find(this.middlewares, {name: name});
  }

  abort(msg) {
    throw new Error(msg);
  }
}
