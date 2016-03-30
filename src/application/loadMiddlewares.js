'use strict';

import Logger from './../middlewares/logger';
import Base from './../middlewares/base';
import Session from './../middlewares/session';
import Orm from './../middlewares/orm';
import View from './../middlewares/view';
import Static from './../middlewares/static';
import Passport from './../middlewares/passport';

/**
 * Middleware map
 * @type {Object}
 */
const DEFAULT_MW_ORDER = {
  logger: Logger,
  base: Base,
  session: Session,  
  orm: Orm,  
  view: View,
  static: Static,
  passport: Passport,
};

/**
 * Load middlewares by order
 * @param  {Object} app Application handler
 * @return {Object} Middlewares
 */
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
