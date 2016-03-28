'use strict';

import KoaRouter from 'koa-66';

/**
 * HTTP methods
 * @type {Array}
 */
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

  /**
   * constructor
   * @param  {Object} app Application instance reference
   */
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

    let routes = this.formatRoutes(this.configs.routes);

    _.forEach(routes, (ca, rule) => {
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

  /**
   * Change routes with namespaces to plain rules
   * @param  {Object} routes Raw routes
   * @return {Object} Formated routes
   */
  formatRoutes(routes) {
    const self = this;

    let namespaces = routes['namespaces'];

    if (!namespaces) {
      return routes;
    }

    delete routes['namespaces'];
    let nsRoutes = {};

    _.forEach(namespaces, (prefix, basePath) => {
      let subRoutes = routes[basePath];
      if (subRoutes) {
        delete routes[basePath];
        _.forEach(subRoutes, (ca, rule) => {
          rule = self.parseRule(rule);
          rule = `${rule['methods'].join('|')} ${basePath}${rule['path']}`;
          nsRoutes[rule] = `${prefix}.${ca}`;
        });
      }
    });

    return _.merge(routes, nsRoutes);
  }

  /**
   * Parse one rule
   * @param  {Object} rule 
   * @return {Object} methods + path
   */
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
    str = this.formatController(str);
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

  formatController(str) {
    return str.replace(/(.*\.)?([^\.]+)$/, function(m, prefix, cname) {
      prefix = prefix || '';
      return `${prefix}${cname.capitalize()}Controller`;
    });
  }

}
