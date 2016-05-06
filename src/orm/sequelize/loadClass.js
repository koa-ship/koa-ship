'use strict';    

export default function loadClass(sequelize, name, klass) {
  let methods = inspector(klass);

  let staticMethods = methods.staticMethods;
  let instanceMethods = methods.instanceMethods;

  let options = {
    classMethods: {},
    instanceMethods: {},
    getterMethods: {},
    setterMethods: {},
    hooks: {}
  };

  // static methods
  _.forEach(staticMethods, (method, name) => {
    if (typeof method.value == 'function') options.classMethods[name] = method.value;
  });

  // instance methods
  let hooks = [
    'create', 'destroy', 'update', 'validate'
  ];
  let preHooks = hooks.map((item) => { return 'before' + item.capitalize(); });
  let postHooks = hooks.map((item) => { return 'after' + item.capitalize(); });  

  _.forEach(instanceMethods, (method, name) => {
    if (name == 'constructor') {
      return;
    }

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