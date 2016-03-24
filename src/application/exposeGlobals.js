'use strict';

import util from './../utils';

export default function exposeGlobals(app) {
  global['_'] = util;

  app.debug('expose globals');
};