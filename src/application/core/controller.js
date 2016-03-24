'use strict';

export default class Controller {

  constructor(app, ctx) {
    this.app = app;

    _.forEach(app.globals, (obj, name) => {
      this[name] = obj;
    });
    
    this.ctx = ctx;
    this.req = ctx.req;
    this.res = ctx.res;
    this.cookies = ctx.cookies;
    this.session = ctx.session;
  }

  before() {
  }

  after() {
  }
}