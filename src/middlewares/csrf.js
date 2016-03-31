'use strict';

import csrf from 'csrf';

export default class Csrf {

  constructor(app) {
    this.app = app;
    this.tokens = csrf({});
    this.use();

    app.debug('middleware - csrf loaded');
  }

  use() {
    var tokens = this.tokens;
    var context = this.app.server.context;
    var response = this.app.server.response
    var request = this.app.server.request

    /*
     * Lazily creates a CSRF token.
     * Creates one per request.
     *
     * @api public
     */

    context.__defineGetter__('csrf', function () {
      if (this._csrf) return this._csrf
      if (!this.session) return null
      var secret = this.session.secret
        || (this.session.secret = tokens.secretSync())
      return this._csrf = tokens.create(secret)
    })

    response.__defineGetter__('csrf', function () {
      return this.ctx.csrf
    })

    /**
     * Asserts that a CSRF token exists and is valid.
     * Throws a 403 error otherwise.
     * var body = yield* this.request.json()
     * try {
     *   this.assertCSRF(body)
     * } catch (err) {
     *   this.status = 403
     *   this.body = {
     *     message: 'invalid CSRF token'
     *   }
     * }
     *
     * @param {Object} body
     * @return {Context} this
     * @api public
     **/

    context.assertCSRF =
    context.assertCsrf = function (body) {
      var secret = this.session.secret;
      if (!secret) this.throw(403, 'invalid csrf token');

      var token = (body && body._csrf)
        || (body && body.fields && body.fields._csrf)
        || (this.query && this.query._csrf)
        || (this.get('x-csrf-token'))
        || (this.get('x-xsrf-token'))
        || body;

      if (!tokens.verify(secret, token)) this.throw(403, 'invalid csrf token')

      return this
    };

    request.assertCSRF =
    request.assertCsrf = function (body) {
      this.ctx.assertCsrf(body)
      return this
    };

    this.app.server.use(async function(ctx, next) {
      if (ctx.method === 'GET'
        || ctx.method === 'HEAD'
        || ctx.method === 'OPTIONS'
        || ctx.skipCSRF) {
        return await next();
      }

      ctx.assertCSRF(ctx.request.body)

      await next();
    });    
  }
}