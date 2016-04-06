'use strict';

import util from './../utils';

export default function exposeGlobals(app) {
  global['_'] = util;

  app.set('rootPath', app.rootPath);
  app.set('dataPath', app.dataPath);
  app.set('tmpPath', app.tmpPath);
  app.set('frameworkPath', app.frameworkPath);
  app.set('npmBinPath', app.npmBinPath);

  app.debug('expose globals');
};