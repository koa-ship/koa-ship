'use strict';

import path from 'path';
import fs from 'fs-extra';

/**
 * Use mongodb as default orm connection db
 * @type {Object}
 */
const DEFAULT_ORM_CONFIG = {
  type: 'mongodb',
  host: '127.0.0.1',
  dbname: 'test',
  port: 27017
};

export default class Orm {

  /**
   * Orm middleware
   * @param  {Object} app
   */
  constructor(app) {
    this.app = app;
    this.config = _.merge({}, DEFAULT_ORM_CONFIG, app.configs.orm);
    this.config.models = path.join(app.rootPath, 'app', 'models');

    fs.ensureDirSync(this.config.models);

    this.client = this.createClient();
    app.debug('middleware - orm loaded');
  }

  /**
   * Create orm client
   * @return {Object}
   */
  createClient() {
    let adapter = this.getAdapter(this.config.type);
    let Client = require('./../orm/' + adapter);

    return new Client(this.config);
  }

  /**
   * Get orm adapter by type
   * @param  {String} type Database type
   * @return {String}      Orm adapter
   */
  getAdapter(type) {
    let adapter = 'mongoose';

    switch (type) {
      case 'mongodb':
        adapter = 'mongoose';
        break;
      case 'mysql':
      case 'mariadb':
      case 'sqlite':
      case 'postgres':
      case 'mssql':
        adapter = 'sequelize';
      default:
        break;
    }

    return adapter;
  }

  /**
   * Close connection
   */
  close() {
    if (!this.client) {
      return false;
    }

    this.client.close();
    this.app.debug('middleware - database close');
  }

}
