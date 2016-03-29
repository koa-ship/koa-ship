'use strict';

import passport from 'koa-passport';

export default class Passport {

  constructor(app) {
    this.app = app;
    this.config = app.configs.passport || {};

    this.use();

    app.debug('middleware - passport loaded');
  }

  use() {
    this.app.server
      .use(passport.initialize())
      .use(passport.session());

    let serializeUser = this.config.serializeUser;
    let deserializeUser = this.config.deserializeUser;

    if (typeof serializeUser == 'function') {
      passport.serializeUser(serializeUser);
    }
    
    if (typeof deserializeUser == 'function') {
      passport.deserializeUser(deserializeUser);
    }    
  }
  
}