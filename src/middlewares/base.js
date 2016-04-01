'use strict';

import path from 'path';
import fs from 'fs-extra';
import convert from 'koa-convert';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import bodyParser from 'koa-body';

// https://github.com/dlau/koa-body#options
const DEFAULT_BODY_PARSER_CONFIG = {
  jsonLimit: '1mb',
  formLimit: '128kb',
  textLimit: '128kb',
  encoding: 'utf-8',
  multipart: true,
  strict: true,
  // https://github.com/dlau/koa-body#some-options-for-formidable
  formidable: {
    maxFields: 20,
    maxFieldsSize: '2mb',
    keepExtensions: true,
    hash: 'sha1',
    multiples: true,
  }
};

export default class Base {

  /**
   * Base middleware, contains response time, conditional and etag
   * @param  {Object} app
   */
  constructor(app) {
    this.app = app;
    this.use();

    app.debug('middleware - base loaded');
  }

  /**
   * Use middlewares
   */
  use() {
    this.setResponseTime();

    this.app.server.use(conditional());
    this.app.server.use(etag());

    this.useBodyParser();
  }

  /**
   * X-Response-Time
   */
  setResponseTime() {
    this.app.server.use(async function(ctx, next) {
      let start = Date.now();
      await next();
      let delta = Date.now() - start;
      ctx.set('X-Response-Time', delta);
    });
  }

  /**
   * Use BodyParser
   */
  useBodyParser() {
    let config = this.app.configs.upload || {};
    let uploadPath = path.join(this.app.rootPath, config.uploadPath || 'data/files');
    let options = _.merge({}, DEFAULT_BODY_PARSER_CONFIG, config);

    fs.ensureDirSync(uploadPath);
    this.app.set('uploadPath', uploadPath);
    this.app.server.use(convert(bodyParser(options)));
  }
}