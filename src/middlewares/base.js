'use strict';

import conditional from 'koa-conditional-get';
import etag from 'koa-etag';

export default class Base {

  /**
   * Base middleware, contains response time, conditional and etag
   * @param  {Object} app
   */
  constructor(app) {
    this.app = app;
    this.server = app.server;

    this.responseTime();

    this.server.use(conditional());
    this.server.use(etag());

    app.debug('middleware - base loaded');
  }

  responseTime() {
    this.server.use(async function(ctx, next) {
      var start = Date.now();
      await next();
      var delta = Date.now() - start;
      ctx.set('X-Response-Time', delta);
    });
  }

}