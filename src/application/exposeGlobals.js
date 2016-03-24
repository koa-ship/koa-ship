'use strict';

import util from './../util';

export default function exposeGlobals(app) {
  global['_'] = util;

  app.debug('expose globals');
};