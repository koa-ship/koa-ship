import lodash from 'lodash';
import fs from 'fs';

export default {

  fileExists: function(file) {
    try {
      fs.statSync(file);
      return true;
    } catch (e) {
      return false;
    }
  },

  safeMixin: function(obj) {
    let _ = lodash;
    _.each(_.functions(obj), function(name) {
      if (_.prototype[name]) {
        return;
      }
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });
  },

  toTagsArray: function(tagStr) {
    if (Array.isArray(tagStr)) {
      return tagStr;
    }

    tagStr = lodash.toString(tagStr);

    let tags = [];
    lodash.forEach(tagStr.split(/[,\\\uff0c]/), function(tag) {
      tag = tag.trim();
      if (tag == '' || (tags.indexOf(tag) != -1)) {
        return;
      }

      tags.push(tag);
    });

    return tags;
  },

  assertString: function(input) {
    if (typeof input !== 'string') {
      throw new TypeError('The input is not a string type.');
    }
  },

  trimAll: function(str) {
    return str.replace(/ /g, '');
  },

  cutHead: function(str, head) {
    if (!str.startsWith(head)) {
      return str;
    }

    return str.slice(head.length);
  },

  cutTail: function(str, tail) {
    if (!str.endsWith(tail)) {
      return str;
    }

    return str.slice(0, -tail.length);
  },

  isEmptyObject: function(obj) {
    return !Object.keys(obj).length;
  },

  pickWithKeys: function(params, keys, defaultVal = null) {
    let picked = {};

    if (Array.isArray(keys[0])) {
      keys = keys[0];
    }

    for(let key of keys) {
      picked[key] = (params[key] === undefined) ? defaultVal : params[key];
    }

    return picked;
  },

  overwrite: function(rawData, overwriteData) {
    lodash.forEach(overwriteData, (value, name) => {
      rawData[name] = value;
    });

    return rawData;
  },

  sleep: function(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  },

  timeToSeconds: function(hTime, defaultTime = 0) {
    if (!hTime) {
      return defaultTime;
    }
    
    if (typeof hTime == 'number') {
      return parseInt(hTime, 10);
    }

    hTime = (hTime).toString();
    let matcher = hTime.match(/^(\d+)(.+)$/);
    if (!matcher) {
      return defaultTime;
    }

    let num = matcher[1];
    let unit = matcher[2].toLowerCase();
    let seconds = defaultTime;

    switch (unit) {
      case 's':
      case 'second':
      case 'seconds':
          seconds = num;
          break;
      case 'm':
      case 'min':
      case 'minute':
      case 'minutes':
          seconds = 60 * num;
          break;
      case 'h':
      case 'hour':
      case 'hours':
          seconds = 3600 * num;
          break;
      case 'd':
      case 'day':
      case 'days':
          seconds = 86400 * num;
          break;
      case 'w':
      case 'week':
      case 'weeks':
          seconds = 604800 * num;
          break;
      case 'mon':
      case 'month':
      case 'months':
          seconds = 2592000 * num;
          break;
      case 'y':
      case 'year':
      case 'years':
          seconds = 31536000 * num;
          break;
      case 'forever':
          seconds = -1;
          break;
      default:
          seconds = defaultTime;
          break;
    }

    return seconds;
  }

};
