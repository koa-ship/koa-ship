import Application from './../../src/application';

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
    });
  });

});