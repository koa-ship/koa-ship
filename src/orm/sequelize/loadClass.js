'use strict';    

export default function loadClass(sequelize, name, klass) {
  let proto = klass.prototype;
  let staticProps = Object.getOwnPropertyNames(klass);
  let prototypeProps = Object.getOwnPropertyNames(proto);
  let instanceProps = prototypeProps.filter(name => name !== 'constructor');

  let options = {
    classMethods: {},
    instanceMethods: {},
    getterMethods: {},
    setterMethods: {},
    hooks: {}
  };

  // static methods
  staticProps.forEach(name => {
    let method = Object.getOwnPropertyDescriptor(klass, name);
    if (typeof method.value == 'function') options.classMethods[name] = method.value;
  });

  // instance methods
  let hooks = [
    'create', 'destroy', 'update', 'validate'
  ];
  let preHooks = hooks.map((item) => { return 'before' + item.capitalize(); });
  let postHooks = hooks.map((item) => { return 'after' + item.capitalize(); });  

  instanceProps.forEach(name => {
    let method = Object.getOwnPropertyDescriptor(proto, name);

    if (preHooks.indexOf(name) != -1) {
      let index = preHooks.indexOf(name);
      options.hooks[hooks[index]] = method.value;
    } else if (postHooks.indexOf(name) != -1) {
      let index = postHooks.indexOf(name);
      options.hooks[hooks[index]] = method.value;
    } else {
      if (typeof method.value == 'function') options.instanceMethods[name] = method.value;
      if (typeof method.get == 'function') options.getterMethods[name] = method.get;
      if (typeof method.set == 'function') options.setterMethods[name] = method.set;
    }
  });  

  let schema = klass.schema();

  return sequelize.define(name, schema.fields, options);
};    