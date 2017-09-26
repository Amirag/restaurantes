/*eslint-env node*/

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

function localAuthenticate(User, email, password, done) {
  User.findOne({
    where: {
      email: email.toLowerCase(),
      deletedAt: null
    }
  })
    .then(user => {
      if (!user) {
        return done(null, false, {
          message: 'Usuario y/o contraseña incorrectos'
        });
      }
      user.authenticate(password)
        .then(authenticate => {
          if (authenticate) {
            return done(null, user);
          }
          console.log('failed auth');
          return done(null, false, {
            message: 'Usuario y/o contraseña incorrectos'
          });
        });
/*
      user.authenticate(password, function(authError, authenticate) {
        if (authError) {
          return done(authError);
        }

        if (!authenticate) {
          return done(null, false,
            { message: 'Usuario y/o contraseña incorrectos' });
        } else {
          return done(null, user);
        }
      });
      */
    })
    .catch(err => done(err));
}

export function setup(User) {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, function(email, password, done) {
    return localAuthenticate(User, email, password, done);
  }));
}
