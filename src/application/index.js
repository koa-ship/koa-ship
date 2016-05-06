'use strict';

import path from 'path';
import fs from 'fs-extra';
import debug from 'debug';
import repl from 'repl';

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

    this.tmpPath = path.join(this.rootPath, 'tmp');
    fs.ensureDirSync(this.tmpPath);

    this.dataPath = path.join(this.rootPath, 'data');
    fs.ensureDirSync(this.dataPath);
  }

  loadEnv() {
    let env = 'production';

    // read env from env.js file
    const envfile = path.join(this.rootPath, 'env.js');
    if (!this.fileExists(envfile)) {
      return env;
    }

    env = require(envfile);

    // NODE_ENV will overwrite env
    env = process.env.NODE_ENV || env;

    return formatEnv(env);
  }

  fileExists(file) {
    try {
      fs.stat(file);
      return true;
    } catch (e) {
      return false;
    }
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

    // TODO: warnning keys should set
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

    loadMiddlewares(this);
    loadAppClasses(this);
  }

  repl() {
    console.log('Starting console, press ^D to exit.');
    this.boot();

    let replServer = repl.start('> ');
    replServer.on('exit', () => {
      process.exit();
    });    
  }

  start() {
    this.debug('app start');

    let router = new Router(this);
    router.loadRules();

    let port = this.configs.app.port;
    this.debug(`listening on port ${port}`);
    this.server.listen(port);
  }

  run(cb) {
    this.boot();
    this.start();

    if (typeof cb == 'function') {
      cb();
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