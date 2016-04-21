'use strict';

export default class Filter {

  constructor(app) {
    const self = this;

    app.set('filter', function(rawParams, rules, throwError = false) {
      let [errors, raw, params] = self.filter(rawParams, rules)

      if (throwError) {
        if (Object.keys(errors).length > 0) {
          throw new Error(self.plainErrors(errors));
        } else {
          return params;
        }
      } else {
        if (Object.keys(errors).length == 0) {
          errors = null;
        }
        return { raw: raw, params: params, errors: errors, error: self.plainErrors(errors) };
      }
    });

    app.debug('middleware - filter loaded');
  }

  plainErrors(errors) {
    if (errors) {
      return JSON.stringify(errors);
    } else {
      return null;
    }
  }
  
  defaultVal(type) {
    var empty;

    switch(type) {
      case 'int':
      case 'integer':
      case 'number':
        empty = 0; break;
      case 'float':
        empty = 0.0; break;
      case 'bool':
      case 'boolean':
        empty = false; break;
      case 'string':
        empty = ''; break;
      case 'array':
      case 'arr':
        empty = []; break;
      case 'object':
      case 'obj':
        empty = {}; break;
      default:
        empty = null; break;
    }

    return empty;
  }

  filter(rawParams, rules = {}) {
    const self = this;

    let errors = {};
    let raw = rawParams;
    let params = {};

    _.forEach(rules, (rule, name) => {
      let err = null;
      let value = rawParams[name];

      rule.name = rule.name || name;

      [err, value] = self.check(value, rule);
      if (err) {
        errors[name] = err;
      } else {
        params[name] = value;
      }
    });
    
    return [errors, raw, params];
  }

  check(value, rule) {
    let err = null;
    const name = rule.name;

    if (rule.trim && typeof value == 'string') {
      value = value.trim();
    }

    if (value === undefined || value === null || value === '') {
      if (rule.required) {
        return [`${name} 不能为空`, value];
      } else {
        value = rule.default;
      }      
    }

    if (rule.required === false && value == null) {
      return [null, null];
    }

    [err, value] = this.deepCheck(value, rule);
    if (err) {
      return [err, value];
    }

    var validationFn = rule.validate;
    if (validationFn && typeof validationFn == 'function' && !validationFn(value)) {
      return [`${name} 无效`, value];
    }

    return [err, value];
  }

  deepCheck(value, rule) {
    const fnName = 'check' + rule.type.capitalize();
    const checkFn = this[fnName];

    if (typeof checkFn == 'function') {
      return checkFn(_.toString(value), rule);
    } else {
      return this.checkString(value, rule);
    }
  }

  // checkers
  checkString(value, rule) {
    const name = rule.name;
    rule.escape = (rule.escape === false) ? false : (rule.escape || true);

    if (rule.escape) {
      value = _.escape(value);
    }

    if (rule.length) {
      if (rule.length[0] && value.length < rule.length[0]) {
        return [`${name} 的长度不能小于 ${rule.length[0]}`, value];
      }
      if (rule.length[1] && value.length > rule.length[1]) {
        return [`${name} 的长度不能大于 ${rule.length[1]}`, value];
      }
    }

    if (rule.enum && Array.isArray(rule.enum) && rule.enum.indexOf(value) === -1) {
      let values = rule.enum.join(', ');
      return [`${name} 的值必须是 "${values}" 其中之一`, value];
    }

    if (rule.match && (rule.match instanceof RegExp) && !value.match(rule.match)) {
      return [`${name} 格式不正确`, value];
    }

    return [null, value];
  }

  checkStr(value, rule) {
    return this.checkString(value, rule);
  }

  checkRange(value, rule) {
    const name = rule.name;

    if (rule.range) {
      if (rule.range[0] && value < rule.range[0]) {
        return [`${name} 的值不能小于 ${rule.range[0]}`, value];
      }

      if (rule.range[1] && value > rule.range[1]) {
        return [`${name} 的值不能大于 ${rule.range[1]}`, value];
      }
    }

    return [null, value];  
  }

  checkInteger(value, rule) {
    const name = rule.name;

    if (!_.isInt(value)) {
      return [`${name} 不是一个整数`, value];
    }

    value = _.toInt(value);
    return this.checkRange(value, rule);
  }

  checkInt(value, rule) {
    return this.checkInteger(value, rule);
  }

  checkFloat(value, rule) {
    const name = rule.name;

    if (!_.isFloat(value)) {
      return [`${name} 不是一个浮点数`, value];
    }

    value = _.toFloat(value);
    return this.checkRange(value, rule);
  }

  checkNumber(value, rule) {
    const name = rule.name;

    if (!_.isNumeric(value)) {
      return [`${name} 不是一个数字`, value];
    }

    value = _.toFloat(value);
    return this.checkRange(value, rule); 
  }

  checkBoolean(value, rule) {
    value = _.toBoolean(value);
    return [null, value];
  }

  checkBool(value, rule) {
    return this.checkBoolean(value, rule);
  }

  checkArray(value, rule) {
    const name = rule.name;

    if (typeof value == 'string') {
      value = [value];
    }

    if (!Array.isArray(value)) {
      return [`${name} 不是有效的一组值`, value];
    }

    return [null, value];
  }

  checkObject(value, rule) {
    const name = rule.name;

    if (typeof value != 'object') {
      return [`${name} 不是一个有效的对象`, value];
    }

    return [null, value];
  }

  checkObj(value, rule) {
    return this.checkObject(value, rule);
  }

  checkJson(value, rule) {
    const name = rule.name;

    if (!_.isJSON(value)) {
      return [`${name} 不是一个有效json字符串`, value];
    }

    value = JSON.parse(value);

    return [null, value];
  }

  checkDate(value, rule) {
    const name = rule.name;

    if (!Date.parse(value)) {
      return [`${name} 不是一个时间类型`, value];
    }

    // TODO: range

    return [null, value];
  }

  checkTimestamp(value, rule) {
    const name = rule.name;

    if (!_.isInt(value)) {
      return [`${name} 不是一个有效的时间戳`, value];
    }

    value = _.moment(_.toInt(value) * 1000).toDate();

    // TODO: range

    return [null, value];  
  }

  checkEmail(value, rule) {
    const name = rule.name;

    if (!_.isEmail(value)) {
      return [`${name} 不是一个有效的邮件`, value];
    }

    value = _.normalizeEmail(value);
    return [null, value];
  }

  checkIP(value, rule) {
    const name = rule.name;

    if (!_.isIP(value)) {
      return [`${name} 不是一个有效的IP地址`, value];
    }

    return [null, value];
  }

  checkIp(value, rule) {
    return this.checkIP(value, rule);
  }

  checkMongoid(value, rule) {
    const name = rule.name;

    if (!_.isMongoId(value)) {
      return [`${name} 不是一个有效的MongoID`, value];
    }

    return [null, value];
  }
}