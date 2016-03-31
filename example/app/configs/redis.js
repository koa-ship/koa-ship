module.exports = {
  host: '127.0.0.1',
  port: 6379,

  // db index
  dbs: {
    main: 0,
    session: 1,
  },

  keys: {
    session: { prefix: 'session', expire: '1d', db: 'session' },
  }
};