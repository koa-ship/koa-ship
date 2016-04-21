'use strict';

import session from 'koa-generic-session';
import convert from 'koa-convert';
import redisStore from 'koa-redis';

const DEFAULT_REDIS_CONFIG = {
  host: '127.0.0.1',
  port: 6379
};

const DEFAULT_SESSION_CONFIG = {
  key: 'appid',
  prefix: 'app:session:',
  cookie: { path: '/', maxage: null, rewrite: true, signed: true },
  ttl: 3600 * 1000,
  reconnectTimeout: 10000,
  rolling: true
};

export default class Session {

  /**
   * Session middleware
   * @param  {Object} app
   */
  constructor(app) {
    this.app = app;
    this.config = app.configs.session || {};

    this.sessionOptions = _.merge({}, DEFAULT_SESSION_CONFIG, this.config);
    this.store = redisStore(_.merge({}, DEFAULT_REDIS_CONFIG, this.config.redis));
    this.sessionOptions.store = this.store;

    this.use();

    app.debug('middleware - session loaded');
  }

  /**
   * Use middlewares
   */
  use() {
    this.app.server.use(convert(
      session(this.sessionOptions)
    ));    
  }

  close() {
    if (!this.store.client) {
      return;
    }

    this.store.client.end();
    this.app.debug('middleware - session close');
  }  
}
