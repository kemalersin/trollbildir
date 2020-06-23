import passport from 'passport';

import config from '../../config/environment';
import { Strategy as LocalStrategy } from 'passport-local';

function localAuthenticate(User, username, password, done) {
    User.findOne({ $or: [{ username }, { email: username }] }).exec()
        .then(user => {
            if (!user || user.isBanned) {
                return done(null, false, config.errors.userNotFound);
            }

            user.authenticate(password, function (authError, authenticated) {
                if (authError) {
                    return done(authError);
                }

                if (!authenticated) {
                    return done(null, false, config.errors.incorrectPassword);
                } else {
                    return done(null, user);
                }
            });
        })
        .catch(err => done(err));
}

export function setup(User) {
    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function (username, password, done) {
        return localAuthenticate(User, username, password, done);
    }));
}