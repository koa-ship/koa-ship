'use strict';

import Logger from './../middlewares/logger';
import Base from './../middlewares/base';
import Redis from './../middlewares/redis';
import Session from './../middlewares/session';
import Orm from './../middlewares/orm';
import View from './../middlewares/view';
import Static from './../middlewares/static';
import Filter from './../middlewares/filter';
import Csrf from './../middlewares/csrf';
import Asset from './../middlewares/asset';
import Passport from './../middlewares/passport';

/**
 * Middleware map
 * @type {Object}
 */
const DEFAULT_MW_ORDER = {
  logger: Logger,
  base: Base,
  redis: Redis,
  session: Session,
  orm: Orm,  
  view: View,
  static: Static,
  filter: Filter,
  csrf: Csrf,
  asset: Asset,
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

  for(let mw of order) {
    let Middleware = custom[mw] || DEFAULT_MW_ORDER[mw];
    if (Middleware && typeof(Middleware) == 'function') {
      app.middlewares.push({
        name: mw,
        handler: new Middleware(app)
      });
    }
  }
};
