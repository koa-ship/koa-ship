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
    this.config = app.configs.log || DEFAULT_LOGGER_CONFIG;

    if (app.env == 'development') {
      app.server.use(logger());
      app.debug('middleware - logger loaded');
    }

    // init
    const logDir = path.join(app.rootPath, this.config.baseDir);
    fs.ensureDirSync(logDir);

    // create app logger
    this.createLogger(logDir);
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