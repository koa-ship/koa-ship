'use strict';

import path from 'path';
import debug from 'debug';

export default class Application {

  constructor(rootPath, frameworkPath = null) {
    this.setDirs(rootPath, frameworkPath);

    this.globals = {};
    this.middlewares = [];

    this.debug = debug('koa-ship');
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

  run(cb) {
    this.debug('app run');
    if (typeof cb == 'function') {
      cb();
    }
  }
}