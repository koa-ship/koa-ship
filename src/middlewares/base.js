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
  }

  /**
   * X-Response-Time
   */
  setResponseTime() {
    this.app.server.use(async function(ctx, next) {
      var start = Date.now();
      await next();
      var delta = Date.now() - start;
      ctx.set('X-Response-Time', delta);
    });
  }

}