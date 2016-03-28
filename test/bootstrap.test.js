const path = require('path');
const chai = require('chai');

require('node-next');

// expose globals
global['assert'] = chai.assert;
global['expect'] = chai.expect;
global['should'] = chai.should();

global['frameworkPath'] = path.dirname(__dirname);
global['rootPath'] = path.join(frameworkPath, 'example');

// hooks
before((done) => {
  done();
});

after((done) => {
  done();
});
