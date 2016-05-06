'use strict';

import inspector from 'class-inspector';

function wrap(schema, klass) {
  let methods = inspector(klass);

  let staticMethods = methods.staticMethods;
  let instanceMethods = methods.instanceMethods;

  // static methods
  _.forEach(staticMethods, (method, name) => {
    if (typeof method.value == 'function') schema.static(name, method.value);
  });

  // instance methods
  let hooks = [
    'init', 'validate', 'save', 'remove', 'update',
    'count', 'find', 'findOne', 'findOneAndRemove', 'findOneAndUpdate'
  ];
  let preHooks = hooks.map((item) => { return 'pre' + item.capitalize(); });
  let postHooks = hooks.map((item) => { return 'post' + item.capitalize(); });  

  _.forEach(instanceMethods, (method, name) => {
    if (name == 'constructor') {
      return;
    }

    if (preHooks.indexOf(name) != -1) {
      schema.pre(hooks[preHooks.indexOf(name)], method.value);
    } else if (postHooks.indexOf(name) != -1) {
      schema.post(hooks[postHooks.indexOf(name)], method.value);
    } else {
      if (typeof method.value == 'function') schema.method(name, method.value);
      if (typeof method.get == 'function') schema.virtual(name).get(method.get);
      if (typeof method.set == 'function') schema.virtual(name).set(method.set);
    }
  });

  let indexes = klass.schema().indexes;
  if (indexes) {
    for(let index of indexes) {
      if (Array.isArray(index)) {
        if (index[1]) {
          schema.index(index[0], index[1]);
        } else {
          schema.index(index[0]);
        }
      } else {
        schema.index(index);
      }      
    };
  }
}

export default function loadClass(schema, klass) {
  if (klass) {
    wrap(schema, klass);
  } else {
    return (klass) => wrap(schema, klass);
  }
};