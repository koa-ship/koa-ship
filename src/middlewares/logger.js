'use strict';

import path from 'path';
import fs from 'fs-extra';
import logger from 'koa-logger';
import bunyan from 'bunyan';

const DEFAULT_LOGGER_CONFIG = {
  level: 'debug',
  baseDir: 'data/logs'
};

export default class Logger {

  /**
   * Logger middleware
   * @param  {Object} app Application instance reference
   */
  constructor(app) {
    this.app = app;
    this.config = _.defaults(DEFAULT_LOGGER_CONFIG, app.configs.log);

    this.logDir = path.join(app.rootPath, this.config.baseDir);
    fs.ensureDirSync(this.logDir);    

    this.use();

    app.debug('middleware - logger loaded');
  }

  /**
   * Use middlewares
   */
  use() {
    if (this.app.env == 'development') {
      this.app.server.use(logger());
    }

    this.createLogger(this.logDir);
  }

  /**
   * createLogger with bunyan
   * @param  {String} logDir Log directory
   */
  createLogger(logDir) {
    const appName = this.app.configs.app.name;

    this.app.set('log', bunyan.createLogger({
      name: appName,
      serializers: {
        req: bunyan.stdSerializers.req
      },
      streams: [{
        level: this.config.level,
        type: 'rotating-file',
        path: path.join(logDir, `${appName}.log`),
        period: '1d',
        count: 30
      }]
    }));
  }
}