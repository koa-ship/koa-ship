'use strict';

import Logger from './../middlewares/logger';
import Base from './../middlewares/base';
import View from './../middlewares/view';
import Session from './../middlewares/session';
import Passport from './../middlewares/passport';

const DEFAULT_MW_ORDER = {
  logger: Logger,
  base: Base,
  session: Session,  
  // view: View,
  passport: Passport,
};

export default function loadMiddlewares(app) {
  app.debug('load middlewares')

  let config = app.configs.middlewares || {};
  let order = config.order || Object.keys(DEFAULT_MW_ORDER);
  let custom = config.custom || {};
  let middlewares = [];

  for(let mw of order) {
    let Middleware = custom[mw] || DEFAULT_MW_ORDER[mw];
    if (Middleware && typeof(Middleware) == 'function') {
      middlewares.push(new Middleware(app));
    }
  }

  return middlewares;
};
