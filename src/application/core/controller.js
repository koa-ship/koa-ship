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
   * Set layout
   * @param  {String} name Layout name
   */
  layout(name) {
    this.ctx.state.layout = name;
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

  /**
   * Expose helper functions to context
   * @param  {...String} names Helper names
   */
  helper(...names) {
    let ctx = this.ctx;

    for(let name of names) {
      let Helper = global[`${name.capitalize()}Helper`];
      if (Helper) {
        for(let fn of Object.keys(Helper)) {
          ctx.state[fn] = Helper[fn];
        }
      }
    }
  }

  /**
   * Get flash data from previous request or pass it to the next
   * @param  {Object} data Flash data
   */
  flash(data) {
    if (data == undefined) {
      return this.ctx.flash;
    }

    this.ctx.flash = data;
  }

  /**
   * 404 error
   */
  pageNotFound() {
    this.ctx.throw(404);
  }

  /**
   * Redirect to url
   * @param  {String} url    Dest url
   * @param  {Number} status Http status
   */
  redirect(url, status = 302) {
    this.status = status;
    this.ctx.redirect(url);
  }

  /**
   * Wirte data to flash and redirect to url
   * @param  {String} url  Dest url
   * @param  {Object} data Flash data
   * @param  {Number} status Http status
   */
  redirectWithFlash(url, data, status = 302) {
    this.flash(data);
    this.redirect(url, status);
  }

  /**
   * Filter params with names from context
   * @param  {...Array} names Keys
   * @return {Array}          Picked params
   */
  params(...names) {
    let params = {};

    params = _.merge(params, this.ctx.query);
    params = _.merge(params, this.ctx.request.body);
    params = _.merge(params, this.ctx.params);

    if (Array.isArray(names[0])) {
      names = names[0];
    }    

    if (names.length == 0) {
      return params;
    } else {
      return _.pickWithKeys(params, names);
    }
  }

  /**
   * Filter params with rules
   * @param  {...Array} names  Keys
   * @return {Object}          { raw: {}, params: {}, error: '', errors: {}}
   */
  filterWith(...names) {
    let throwError = false;

    if (Array.isArray(names[0])) {
      names = names[0];
      throwError = (names[1] === true);
    }    

    let rawData = this.params(names);    
    let rules = this.rules || {};
    rules = _.pickWithKeys(rules, names, { type: 'string', required: true });

    return this.filter(rawData, rules, throwError);
  }

  /**
   * Filter all params registed in rules
   * @return {Object}          { raw: {}, params: {}, error: '', errors: {}}
   */
  filterAll() {
    let rawData = this.params();    
    let rules = this.rules || {};
    return this.filter(rawData, rules);
  }
}