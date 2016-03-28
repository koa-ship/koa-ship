import Application from './../../src/application';
import Router from './../../src/application/core/router';

describe('Application', () => {
  var app;

  before((done) => {
    app = new Application(rootPath);
    done();
  });

  describe('loadEnv()', () => {
    it('should load an envString', () => {
      expect(app.loadEnv()).to.equal('development');
    });
  });

  describe('loadAppClasses()', () => {
    it('should load BaseController after app boot', () => {
      app.boot();
      expect(Controller).to.not.be.undefined;
    });
  });

  describe('loadAppClasses()', () => {
    it('should load BaseController after app boot', () => {
      app.boot();
      expect(Controller).to.not.be.undefined;
    });
  });

  describe('loadRules()', () => {
    it('should parse routes to expected format', () => {
      app.boot();
      let router = new Router(app);
      router.loadRules();
    });
  });
});