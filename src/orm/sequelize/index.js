'use strict';

import path from 'path';
import fs from 'fs-extra';

import Sequelize from 'sequelize';
import loadClass from './loadClass';

class Client {

  constructor(app, config) {
    this.app = app;
    this.config = config;

    this.connect();
    this.exposeGlobals();    
  }

  connect() {
    let dbname = this.config.dbname || 'test';
    let user = this.config.user || null;
    let password = this.config.password || null;
    let options = {
      host: this.config.host || '127.0.0.1',
      dialect: this.config.type,
      pool: { max: 5, min: 0, idle: 10000 },
      timezone: this.config.timezone || 'Asia/Shanghai',
    };

    if (this.config.type == 'sqlite') {
      let basename = 'main.sqlite';
      let dirname = 'data/db';

      if (this.config.storage) {
        basename = path.basename(this.config.storage);
        dirname = path.dirname(this.config.storage);
      }

      let storagePath = path.join(this.app.rootPath, dirname);
      fs.ensureDirSync(storagePath);

      options['storage'] = path.join(storagePath, basename);
    }

    this.sequelize = new Sequelize(dbname, user, password, options);
  }

  exposeGlobals() {
    const self = this;

    global['Sequelize'] = Sequelize;

    let classes = _.requireAll({
      dirname : this.config.models,
      filter : /(.+)\.js$/
    });

    let models = [];
    _.forEach(classes, (klass, name) => {
      global[name] = self.createModel(name, klass);
      models.push(klass);
    });

    // Load relations
    _.forEach(models, (klass) => {
      if (typeof klass['init'] == 'function') {
        klass.init();
      }
    });
  }

  createModel(name, klass) {
    return loadClass(this.sequelize, name, klass);
  }

  close() {

  }
}

module.exports = Client;
