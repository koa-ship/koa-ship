'use strict';

import KoaRouter from 'koa-66';

const METHODS = [
  'options',
  'head',
  'get',
  'post',
  'put',
  'patch',
  'delete'
];

export default class Router {

  constructor(app) {
    this.app = app;
    this.debug = app.debug;
    this.abort = app.abort;
    this.server = app.server;
    this.engine = new KoaRouter();
    this.configs = app.configs;
  }

  loadRules() {
    let self = this;

    if (!this.configs.routes) {
      return false;
    }

    _.forEach(this.configs.routes, (ca, rule) => {
      const ret = self.parseRule(rule);
      const parts = ca.split('#');
      let controller = self.parseController(parts[0]);
      let action = parts[1];

      for(let method of ret['methods']) {
        if (METHODS.indexOf(method) == -1) {
          self.abort(`method is invalid: ${rule} => ${ca}`);
        }

        self.engine[method](ret['path'], async function(ctx, next) {
          const instance = new controller(self.app, ctx);
          await instance['before']();
          if (ctx.status == 404) {
            await instance[action](next);
          }
          await instance['after']();
        });
      }
    });

    self.server.use(self.engine.routes());
  }

  parseRule(rule) {
    let methods = [];
    let path = '/';

    rule = rule.trim();

    if (rule[0] == '/') {
      methods.push('get');
      methods.push('post');
      path = rule;
    } else {
      const parts = rule.match(/^([\w\|]+)\s+(\/.*)$/);
      if (!parts) {
        return { methods: 'unknown', path: null };
      }

      methods = parts[1].split('|');
      path = parts[2];
    }

    return {
      methods: methods,
      path: path
    };
  }

  parseController(str) {
    str = this.format(str);
    const parts = str.split('.');

    let value = global;
    let n = 0;

    for(let k of parts) {
      if (value[k] == undefined) {
        break;
      }
      value = value[k];
      n ++;
    }

    if (parts.length != n) {
      this.abort('Controller not exists: ' + str);
    }

    return value;
  }

  format(str) {
    return str.replace(/(.*\.)?([^\.]+)$/, function(m, prefix, cname) {
      prefix = prefix || '';
      return `${prefix}${cname.capitalize()}Controller`;
    });
  }

}
