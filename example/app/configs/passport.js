module.exports = {
  serializeUser: function(user, done) {
    done(null, user.id);
  },

  deserializeUser: function(id, done) {
    // UserService.loginInfo(id, done);
  }
};
