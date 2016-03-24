String.prototype.capitalize = function(forceLowerCase = false) {
  if (forceLowerCase) {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
  } else {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }  
};

Object.defineProperty(Error.prototype, 'toJSON', {
  value: function () {
    var alt = {};

    Object.getOwnPropertyNames(this).forEach(function (key) {
      alt[key] = this[key];
    }, this);

    return alt;
  },
  configurable: true
});