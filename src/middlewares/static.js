'use strict';

import fs from 'fs-extra';
import path from 'path';
import send from 'koa-send';

export default class Static {

  /**
   * Static middleware
   * @param  {Object} app
   */
  constructor(app) {
    this.app = app;

    this.use();
    app.debug('middleware - static loaded');
  }

  /**
   * Use middlewares
   */
  use() {
    this.useFavicon();
    this.exposePublicDir();    
  }

  /**
   * Favicon request
   */
  useFavicon() {
    const self = this;

    this.app.server.use(async function(ctx, next) {
      if ('/favicon.ico' != ctx.path) return await next();

      if ('GET' !== ctx.method && 'HEAD' !== ctx.method) {
        ctx.status = 'OPTIONS' == ctx.method ? 200 : 405;
        ctx.set('Allow', 'GET, HEAD, OPTIONS');
        return;
      }

      let favFile = path.join(self.app.rootPath, 'public', 'favicon.ico');

      ctx.set('Cache-Control', 'public, max-age=86400');
      ctx.type = 'image/x-icon';
      ctx.body = fs.readFileSync(favFile);
    });
  }

  /**
   * Expose public directory
   */
  exposePublicDir() {
    const self = this;

    this.app.server.use(async function(ctx, next) {
      await next();

      if (ctx.method != 'HEAD' && ctx.method != 'GET') return;
      // response is already handled
      if (ctx.body != null || ctx.status != 404) return;

      await send(ctx, ctx.path, {
        root: path.join(self.app.rootPath, 'public'),
        index: 'index.html'
      });
    });
  }

}