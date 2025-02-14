const passport = require('passport');
const request = require('request');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using username and ProlificID.
 */
passport.use(new LocalStrategy({ usernameField: 'username' }, (username, prolificID, done) => 
{
  User.findOne({ username: username.toLowerCase() }, (err, user) => 
  {
    if (err) { return done(err); }
    if (!user) 
    {
      return done(null, false, { msg: `username ${username} not found.` });
    }
    user.comparePassword(prolificID, (err, isMatch) => 
    {
      if (err) { return done(err); }
      if (isMatch) 
      {
        return done(null, user);
      }
      return done(null, false, { msg: 'Invalid username or ProlificID.' });
    });
  });
}));


/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}; 
