'use strict';

import path from 'path';
import fs from 'fs-extra';
import glob from 'glob';

/**
 * @param  {String}   App root dir
 * @param  {String}   App env(development|test|staging|production)
 * @return {Array}    App configs
 */
export default function loadConfigs(rootPath, envString) {
  const configsDir = path.join(rootPath, 'app', 'configs');
  const envDir = path.join(configsDir, 'env');
  const envFile = path.join(envDir, envString + '.js');

  let env = {};
  let configs = {};

  fs.ensureDirSync(configsDir);
  fs.ensureDirSync(envDir);

  // Load configs of envirment
  if (fs.existsSync(envFile)) {
    env = require(envFile);
  }

  // Expose env to global, which can be invoke in config files.
  global['env'] = env;

  // Load app configs
  const files = glob.sync(path.join(configsDir, '*.js'));

  for(let file of files) {
    configs[path.basename(file, '.js')] = require(file);
  }

  // set defaults
  let defaultAppConfig = { name: 'app', port: 3000 };
  configs.app = _.merge({}, defaultAppConfig, configs.app || {});
  configs.env = env;

  return configs;
};
