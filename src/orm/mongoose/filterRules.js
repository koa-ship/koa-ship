'use strict';

var format = {
  basic: function(rawRule, type) {
    let rule = {};

    if (type) {
      rule.type = type;
    }

    rule.trim = (rawRule.trim == undefined) ? true : rawRule.trim;
    rule.required = (rawRule.required == undefined) ? false : rawRule.required;

    if (rawRule.default != undefined) {
      rule.default = rawRule.default;
    }

    if (rawRule.validate != undefined) {
      rule.validate = rawRule.validate;
    }

    return rule;
  },

  string: function(rawRule) {
    let rule = format.basic(rawRule, 'string');

    if (rawRule.enum) {
      rule.enum = rawRule.enum;
    }

    if (rawRule.match) {
      rule.match = rawRule.match;
    }

    if (rawRule.minlength || rawRule.maxlength) {
      rule.length = [rawRule.minlength, rawRule.maxlength];
    }

    return rule;
  },

  number: function(rawRule) {
    let rule = format.basic(rawRule, 'number');

    if (rawRule.min || rawRule.max) {
      rule.range = [rawRule.min, rawRule.max];
    }

    return rule;
  },

  date: function(rawRule) {
    let rule = format.basic(rawRule, 'date');

    if (rawRule.min || rawRule.max) {
      rule.range = [rawRule.min, rawRule.max];
    }

    return rule;
  }
};

export default function filterRules(schema, fields) {
  schema.statics.filterRules = function() {
    let rules = {};

    for(let item in fields) {
      let rule = fields[item];
      if (rule.type == undefined) {
        rule = { type: rule };
      }

      let newRule = {};
      if (rule.type == 'string' || rule.type == String) {
        newRule = format.string(rule);
      } else if (rule.type == 'number' || rule.type == Number) {
        newRule = format.number(rule);
      } else if (rule.type == 'date' || rule.type == Date) {
        newRule = format.date(rule);
      } else if (rule.type == 'boolean' || rule.type == Boolean) {
        newRule = format.basic(rule, 'boolean');
      } else if (rule.type.name == 'ObjectId') {
        newRule = format.basic(rule, 'mongoid');
      } else if (Array.isArray(rule.type)) {
        newRule = format.basic(rule, 'array');
      }

      newRule.name = rule.name;
      rules[item] = newRule;
    }
    
    return rules;
  };
};