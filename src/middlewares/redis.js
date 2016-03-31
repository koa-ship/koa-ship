'use strict';

import RD from 'redis';

const DEFAULT_REDIS_CONFIG = {
  host: '127.0.0.1',
  port: 6379,
  dbs: {},
  keys: {}
};

export default class Redis {

  constructor(app) {
    this.app = app;
    this.config = _.merge({}, DEFAULT_REDIS_CONFIG, app.configs.redis);

    this.client = this.createClient();

    app.set('redis', this);

    app.debug('middleware - redis loaded');
  }

  createClient() {
    return RD.createClient({
      host: this.config.host,
      port: this.config.port,

      retry_strategy: function (options) {
        // End reconnecting on a specific error and flush all commands with a individual error
        // if (options.error.code === 'ECONNREFUSED') {
        //     return new Error('The server refused the connection');
        // }
        
        // End reconnecting after a specific timeout and flush all commands with a individual error
        // if (options.total_retry_time > 1000 * 60 * 60) {
        //     return new Error('Retry time exhausted');
        // }

        // End reconnecting with built in error
        // if (options.times_connected > 10) {
        //     return undefined;
        // }

        // reconnect after
        return Math.max(options.attempt * 100, 3000);
      }
    });
  }

  parse(alias, appendix = null) {
    const dbs = this.config.dbs || {};
    const keys = this.config.keys || {};

    if (!keys[alias]) {
      throw new Error(`key alias is not exist: ${alias}`);
    }

    let { prefix, expire, db } = keys[alias];
    if (!prefix || typeof prefix != 'string') {
      throw new Error(`key(${alias}) prefix is illegal`);
    }

    let key = appendix ? `${prefix}:${appendix}` : prefix;
    db = dbs[db] || 0;
    expire = _.timeToSeconds(expire, 1800);

    return { db: db, key: key, expire: expire };    
  }

  set(alias, appendix, data) {
    if (data === undefined) {
      data = appendix;
      appendix = null;
    }

    data = (typeof data == 'string') ? data : JSON.stringify(data);

    let { db, key, expire } = this.parse(alias, appendix);

    this.client.select(db);
    this.client.set(key, data);
    this.client.expire(key, expire);

    return true;
  }

  get(alias, appendix) {
    const self = this;

    let { db, key, expire } = this.parse(alias, appendix);
    this.client.select(db);

    return new Promise((resolve) => {
      self.client.get(key, function(err, ret) {
        if (err) {
          throw new Error(err);
        }

        if (ret === null) {
          return resolve(ret);
        }

        if (_.isJSON(ret)) {
          return resolve(JSON.parse(ret));
        }

        resolve(ret);
      });
    });
  }

  getAll(alias) {
    const self = this;

    let { db, key, expire } = this.parse(alias);
    this.client.select(db);

    return new Promise((resolve) => {
      this.client.keys(key + ':*', function(err, keys) {
        if (err) {
          throw new Error(err);
        }

        let items = {};
        let tasks = [];

        for(let itemKey of keys) {
          tasks.push(function(done) {
            let id = itemKey.replace(/.*:([^:]+)$/, '$1');
            self.client.get(itemKey, function(err, value) {
              if (err) return done(err);
              items[id] = value;
              done();
            })
          });        
        }

        _.async.parallel(tasks, function(err) {
          if (err) throw new Error(err);
          resolve(items);
        });
      });      
    });
  }

  incr(alias, appendix, step = 1) {
    let { db, key, expire } = this.parse(alias, appendix);

    this.client.select(db);
    this.client.incrby(key, step);
    this.client.expire(key, expire);
  }

  decr(alias, appendix, step = 1) {
    let { db, key, expire } = this.parse(alias, appendix);

    this.client.select(db);
    this.client.decrby(key, step);
    this.client.expire(key, expire);
  }

  flushdb(dbname) {
    const dbs = this.config.dbs || {};

    let db = dbs[dbname];
    if (!db) {
      return;
    }

    this.client.select(db);
    this.client.flushdb();
  }

  del(alias, appendix = null) {
    let { db, key } = this.parse(alias, appendix);
    this.client.select(db);
    this.client.del(key);
  }

  delAll(alias) {
    const self = this;

    let { db, key } = this.parse(alias);
    self.client.select(db);

    return new Promise((resolve) => {
      self.client.keys(key + ':*', function(err, keys) {
        if (err) {
          throw new Error(err);
        }

        let tasks = [];
        for(let itemKey of keys) {
          tasks.push(function(done) {
            self.client.del(itemKey);
            done();
          });
        }

        _.async.parallel(tasks, function(err) {
          if (err) throw new Error(err);
          resolve();
        });
      });
    });
  }

  async cache(alias, appendix, cb) {
    if (typeof appendix == 'function') {
      cb = appendix;
      appendix = null;
    }

    let data = await this.get(alias, appendix);

    if (data == null && typeof cb == 'function') {
      data = await cb();
      this.set(alias, appendix, data);
    }

    return data;
  }

  close() {
    if (!this.client) {
      return false;
    }

    this.client.end(true);
    this.app.debug('middleware - redis close');    
  }

}
