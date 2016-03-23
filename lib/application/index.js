'use strict';

import path from 'path';

// import debug from 'debug';

export default class Application {

  constructor(rootPath, frameworkPath = null) {
    this.setDirs(rootPath, frameworkPath);

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

  run(cb) {
    if (cb) {
      cb();
    }
  }
}