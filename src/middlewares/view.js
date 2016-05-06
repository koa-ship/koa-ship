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
    // Expose render tools to context
    this.context.render = this.render();
    this.context.text = this.text();
    this.context.json = this.json();

    // Enable flash
    if (this.app.middlewareIsLoad('session')) {
      this.useFlash();
    }

    // handleError
    this.handleError();
  }

  /**
   * Render html with view file and data
   * @return {Function}
   */
  render() {
    const self = this;

    return function(view, data = {}) {
      data = _.overwrite(this.state, data);

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
      this.body = data || {};
    }
  }  

  /**
   * Render html view file and data
   * @return {String} Html string
   */
  renderView(view, data) {
    const viewFile = path.join(this.app.rootPath, 'app', 'views', `${view}.ejs`);
    if (!_.fileExists(viewFile)) {
      return `File not found: app/views/${view}.ejs`;
    }

    const tpl = fs.readFileSync(viewFile, 'utf8');
    return ejs.render(tpl, data, {
      filename: `app/views/${view}`,
      delimiter: '%',
      compileDebug: false
    });
  }

  /**
   * Use flash
   */
  useFlash() {
    let key = this.app.name + '-flash';

    this.app.server.use(async function(ctx, next) {
      let data = ctx.session[key] || {};

      delete ctx.session[key];

      Object.defineProperty(ctx, 'flash', {
        enumerable: true,
        get: function() {
          return data;
        },
        set: function(val) {
          ctx.session[key] = val;
        }
      });

      await next();

      if (ctx.status == 302 && ctx.session && !(ctx.session[key])) {
        ctx.session[key] = data;
      }
    });
  }  

  handleError() {
    const self = this;
    const env = this.app.env;
    const log = this.app.get('log');

    this.app.server.use(async function(ctx, next) {
      try {
        await next();
        if (ctx.response.status == 404 && !ctx.response.body) {
          ctx.throw(404);
        }
      } catch (err) {
        ctx.status = err.status || 500;

        // handle error
        // https://github.com/koajs/koa/wiki/Error-Handling
        ctx.app.emit('error', err, ctx);

        // https://github.com/trentm/node-bunyan
        if (ctx.status == 500) {
          log.error({req: ctx.req}, err);
        }        

        // accepted types
        var type = ctx.accepts('json', 'html', 'text');

        if (type === 'text') {
          if (env === 'development' || err.expose) {
            ctx.body = err.message;
          } else {
            ctx.body = http.STATUS_CODES[ctx.status];
          }

        } else if (type === 'json') {
          if (env === 'development' || err.expose) {
            ctx.body = {
              error: err.message
            };
          } else {
            ctx.body = {
              error: http.STATUS_CODES[ctx.status]
            }
          }

        } else {
          let errors = self.config.error.errors || {
            '404': 'errors/404',
            '500': 'errors/500',
            'common': 'errors/common'
          };
          let layout = self.config.error.layout || false;
          let view = errors[ctx.status] || errors['common'];
          let options = {
            layout: layout,
            env: env,
            error: err,
            status: ctx.status
          };

          try {
            ctx.render(view, options);
          } catch(e) {
            let html = '';
            
            if (env === 'development' || err.expose) {
              html = [
                '<h2>' + e.code + '</h2>',
                '<h3>' + e.message + '</h3>',
                '<pre><code>' + e.stack + '</code></pre>'
              ].join('');
            }

            ctx.body = html;
          }
        }

      }
    });
  }

}
