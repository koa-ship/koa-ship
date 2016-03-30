'use strict';

import path from 'path';
import fs from 'fs-extra';
import ejs from 'ejs';

const DEFAULT_VIEW_CONFIG = {
  defaultLayout: 'layouts/default',

  error: {
    layout: 'layouts/error',
    errors: {
      '404': 'errors/404',
      '500': 'errors/500',
      'common': 'errors/common'
    }
  }
};

export default class View {

  /**
   * View middleware
   * @param  {Object} app
   */
  constructor(app) {
    this.app = app;
    this.context = this.app.server.context;
    this.config = _.merge({}, DEFAULT_VIEW_CONFIG, app.configs.view);
    this.defaultLayout = this.config.defaultLayout;

    this.use();
    app.debug('middleware - view loaded');
  }

  /**
   * Use middlewares
   */
  use() {
    this.context.render = this.render();
    this.context.text = this.text();
    this.context.json = this.json();
  }

  /**
   * Render html with view file and data
   * @return {Function}
   */
  render() {
    const self = this;

    return function(view, data = {}) {
      data = _.merge(this.state, data);

      let html = self.renderView(view, data);

      let layout = data.layout === false ? false : (data.layout || self.defaultLayout);
      if (layout) {
        data.content = html;
        html = self.renderView(layout, data);
      }

      this.type = 'html';
      this.body = html;
    };
  }

  /**
   * Render html with text
   * @return {Function}
   */
  text() {
    return function(html) {
      this.type = 'html';
      this.body = html;
    }    
  }

  /**
   * Render json with object
   * @return {Function}
   */
  json() {
    return function(data) {
      this.type = 'json';
      this.body = data;
    }
  }  

  /**
   * Render html view file and data
   * @return {String} Html string
   */
  renderView(view, data) {
    const viewFile = path.join(this.app.rootPath, 'app', 'views', `${view}.ejs`);
    if (!fs.existsSync(viewFile)) {
      return `File not found: app/views/${view}.ejs`;
    }

    const tpl = fs.readFileSync(viewFile, 'utf8');

    return ejs.render(tpl, data, {
      delimiter: '%',
      compileDebug: false
    });
  }   

}
