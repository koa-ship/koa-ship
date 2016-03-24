import utility from 'utility';

export default {

  md5: function(data) {
    return utility.md5(data);
  },

  sha1: function(data) {
    return utility.sha1(data);
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
