import loadConfigs from './../../src/application/loadConfigs';

describe('loadConfigs', () => {

  it('should something', async () => {
    let configs = loadConfigs(rootPath, 'development');
    expect(configs.env).to.be.an('object');
    expect(configs.app).to.be.an('object');
  });

});