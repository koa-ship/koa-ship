'use strict';

import path from 'path';
import lodash from 'ks-lodash';

/**
 * Load liberary from rootpath/path/to/lib
 * @param  {Object} app koa-ship Application handler
 * @return {Object}     loaded lib
 */
var loadLib = function(app) {
  return function(libPath) {
    return require(path.join(app.rootPath, 'lib', libPath));
  };
};

/**
 * Expose global variables to application or controller actions
 * @param  {Object} app koa-ship Application handler
 */
export default function exposeGlobals(app) {
  global['_'] = lodash;
  global['requireLib'] = loadLib(app);

  // set consts which can be invoked in action.
  app.set('rootPath', app.rootPath);
  app.set('dataPath', app.dataPath);
  app.set('tmpPath', app.tmpPath);
  app.set('frameworkPath', app.frameworkPath);
  app.set('npmBinPath', app.npmBinPath);

  app.debug('expose globals');
};