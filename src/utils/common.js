import lodash from 'lodash';

export default {

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
