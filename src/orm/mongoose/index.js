'use strict';

import mongoose from 'mongoose';

import loadClass from './loadClass';
import filterRules from './filterRules';
import timestamp from './timestamp';
import pagination from './pagination';

const MONGOOSE_CONN_OPTIONS = {
  db: {
    native_parser: true
  },
  server: {
    poolSize: 5,
    socketOptions: { keepAlive: 1 },
    auto_reconnect: false,     
  },
  replset: {
    socketOptions: { keepAlive: 1 },
    auto_reconnect: false,      
    // rs_name: 'myReplicaSetName'
  }
};

const DEFAULT_MONGOOSE_CONFIG = {
  host: '127.0.0.1',
  port: 27017,
  dbname: 'test',
  user: null,
  password: null
};

class Client {

  constructor(config) {
    this.config = _.merge({}, DEFAULT_MONGOOSE_CONFIG, config);
    this.reconnect = true;

    this.connect();
    this.exposeGlobals();
  }

  connect() {
    const self = this;
    let options = MONGOOSE_CONN_OPTIONS;

    if (this.config.user) {
      options.user = this.config.user;
    }

    if (this.config.password) {
      options.pass = this.config.password;
    }

    let uri = `mongodb://${this.config.host}:${this.config.port}/${this.config.dbname}`;

    mongoose.connection.on('error', function(err) {
      console.trace(err);
    });

    mongoose.connection.on('disconnected', function() {
      if (!self.reconnect) {
        return;
      }

      setTimeout(function() {
        mongoose.connect(uri, options);
      }, 800);
    });

    mongoose.connect(uri, options);    
  }

  exposeGlobals() {
    const self = this;

    global['Schema'] = mongoose.Schema;

    let classes = _.requireAll({
      dirname : this.config.models,
      filter : /(.+)\.js$/
    });

    _.forEach(classes, (klass, name) => {
      global[name] = self.createModel(name, klass);
    }); 
  }

  createModel(name, klass) {
    let schema = klass.schema();
    let options = schema.options || {};

    if (schema.name) {
      options.collection = schema.name;
    }

    let schemaObj = new mongoose.Schema(schema.fields, options);

    // load plugins
    schemaObj.plugin(loadClass, klass);
    schemaObj.plugin(filterRules, schema.fields);

    schemaObj.plugin(timestamp);
    schemaObj.plugin(pagination);

    // create ModelClass
    let ModelClass = mongoose.model(name, schemaObj);
    ModelClass.on('error', function(err) {
      console.trace(err);
    });

    return ModelClass;
  }

  close() {
    this.reconnect = false;
    mongoose.disconnect();
  }

}

module.exports = Client;