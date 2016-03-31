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
    this.set('_csrf', this.ctx.csrf);
    this.set('csrf_tag', '<input type="hidden" name="_csrf" value="' + this.ctx.csrf + '">');    
  }

  after() {
  }

  /**
   * Pass params to state which can be invoke in view.
   * @param {String|Object} key   Key or kv map
   * @param {Object}        value 
   */
  set(key, value) {
    if (typeof key == 'object') {
      _.forEach(key, (v, k) => {
        this.ctx.state[k] = v;
      });
    } else {
      this.ctx.state[key] = value;
    }
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