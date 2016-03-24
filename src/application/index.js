'use strict';

import path from 'path';
import debug from 'debug';

import Koa from 'koa';

import loadMiddlewares from './loadMiddlewares';

export default class Application {

  constructor(rootPath, frameworkPath = null) {
    this.setDirs(rootPath, frameworkPath);

    this.server = new Koa();
    this.debug = debug('koa-ship');

    this.globals = {};
    this.middlewares = [];
  }

  setDirs(rootPath, frameworkPath) {
    this.rootPath = rootPath;

    if (frameworkPath == null) {
      frameworkPath = path.dirname(path.dirname(__dirname));
    }

    this.frameworkPath = frameworkPath;
    this.npmBinPath = path.join(this.rootPath, 'node_modules', '.bin');
  }

  set(name, object) {
    this.globals[name] = object;
  }

  get(name) {
    return this.globals[name];
  }

  boot(cb) {
    this.debug('app boot');
    this.middlewares = loadMiddlewares(this);
    cb();
  }

  start() {
    this.debug('app start');
  }

  run(cb) {
    const self = this;

    self.boot(function(err) {
      self.start();
      if (typeof cb == 'function') cb(err);
    });    
  }
}