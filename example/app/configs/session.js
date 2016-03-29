module.exports = {

  key: 'appid',
  prefix: 'example:session:',
  ttl: 24* 3600 * 1000,

  // reconnectTimeout: 10 * 1000,
  
  cookie: {
    path: '/',
    maxage: 24* 3600 * 1000,
    rewrite: true,
    signed: false
  },

  store: 'redis',

  redis: {
    host: '127.0.0.1',
    port: 6379
  }

};