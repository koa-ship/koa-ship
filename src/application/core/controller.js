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

  /**
   * Render html with view file and data
   * @param  {String} view View file path
   * @param  {Object} data
   */
  render(view, data = {}) {
    this.ctx.render(view, data);
  }

  /**
   * Render html
   * @param  {String} html
   */
  text(html) {
    this.ctx.text(html);
  }

  /**
   * Render json
   * @param  {Objecdt} data
   */
  json(data) {
    this.ctx.json(data);
  }

}