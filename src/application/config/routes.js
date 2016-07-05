'use strict';

const path = require('path');
const glob = require('glob');

class RoutesConfig {

  constructor(configsDir) {
    this.configsDir = configsDir;
    this.routes = {
      namespaces: {},
      // 'get /': 'home#index',
    };
  }

  setBaseRoutes(base) {
    this.routes = _.merge(this.routes, base || {});
  }

  load() {
    const files = glob.sync(path.join(this.configsDir, 'routes', '*.js'));

    for(let file of files) {
      let name = path.basename(file, '.js');
      let subRoutes = require(file);

      if (name == 'routes') {
        throw new Error(`sub routes name is illegal: ${name}`);
      }

      this[name] = subRoutes;
    }
  }

  mount(subRoutes, options) {
    this.routes.namespaces[options.to] = options.dir;
    this.routes[options.to] = subRoutes || {};
    return this;
  }

  merge(subRoutes) {
    this.routes = _.merge(this.routes, subRoutes || {});
    return this;
  }

  export() {
    return this.routes;
  }

}

module.exports = function(base) {
  const configsDir = path.join(rootPath, 'app', 'configs');
  let config = new RoutesConfig(configsDir);

  config.setBaseRoutes(base);
  config.load();

  return config;
};