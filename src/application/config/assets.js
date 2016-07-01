'use strict';

const path = require('path');
const glob = require('glob');

class AssetsConfig {

  constructor(configsDir) {
    this.configsDir = configsDir;
    this.minify = true;

    this.jsConfigs = {};
    this.cssConfigs = {};
  }

  load() {
    const files = glob.sync(path.join(this.configsDir, 'assets', '*.js'));

    for(let file of files) {
      let name = path.basename(file, '.js');
      let assetGroup = require(file);

      if (assetGroup.js) {
        this.jsConfigs[name] = assetGroup.js;
      }

      if (assetGroup.css) {
        this.cssConfigs[name] = assetGroup.css;
      }
    }
  }

  export() {
    return {
      minify: this.minify,
      js: this.jsConfigs,
      css: this.cssConfigs,
    };
  }

}

module.exports = function(options) {
  const configsDir = path.join(rootPath, 'app', 'configs');
  let config = new AssetsConfig(configsDir);

  config.minify = (options.minify !== false);
  config.load();

  return config;
};
