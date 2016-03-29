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
  ttl: 3600,
  reconnectTimeout: 10000,
};

export default class Session {

  constructor(app) {
    this.app = app;
    this.config = app.configs.session || {};
    this.store = redisStore(_.defaults({}, DEFAULT_REDIS_CONFIG, this.config.redis));

    app.debug('middleware - session loaded');
  }

  /**
   * Use middlewares
   */
  use() {
    let sessionOptions = _.defaults({}, DEFAULT_SESSION_CONFIG, this.config);
    sessionOptions.store = this.store;
    app.server.use(convert(session(sessionOptions)));    
  }

  close() {
    if (!this.store.client) {
      return;
    }

    this.store.client.end();
    this.app.debug('middleware - session close');
  }  
}
