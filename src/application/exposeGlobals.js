'use strict';

import util from './../util';

export default function exposeGlobals(app) {
  global['_'] = util;
  global['config'] = {
    rootPath: app.rootPath
  };

  app.debug('expose globals');
};