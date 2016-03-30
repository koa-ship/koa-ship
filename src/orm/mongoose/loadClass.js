'use strict';

function wrap(schema, klass) {
  let proto = klass.prototype;
  let staticProps = Object.getOwnPropertyNames(klass);
  let prototypeProps = Object.getOwnPropertyNames(proto);
  let instanceProps = prototypeProps.filter(name => name !== 'constructor');

  // static methods
  staticProps.forEach(name => {
    let method = Object.getOwnPropertyDescriptor(klass, name);
    if (typeof method.value == 'function') schema.static(name, method.value);
  });

  // instance methods
  let hooks = [
    'init', 'validate', 'save', 'remove', 'update',
    'count', 'find', 'findOne', 'findOneAndRemove', 'findOneAndUpdate'
  ];
  let preHooks = hooks.map((item) => { return 'pre' + item.capitalize(); });
  let postHooks = hooks.map((item) => { return 'post' + item.capitalize(); });  

  instanceProps.forEach(name => {
    let method = Object.getOwnPropertyDescriptor(proto, name);

    if (preHooks.indexOf(name) != -1) {
      let index = preHooks.indexOf(name);
      schema.pre(hooks[index], method.value);
    } else if (postHooks.indexOf(name) != -1) {
      let index = postHooks.indexOf(name);
      schema.post(hooks[index], method.value);
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