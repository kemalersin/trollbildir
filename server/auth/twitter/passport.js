import passport from 'passport';

import {
    Strategy as TwitterStrategy
} from 'passport-twitter';

import Spam from '../../api/spam/spam.model';
import Queue from '../../api/spam/queue.model';
import Member from '../../api/member/member.model';

const loginError = "Giriş yapılamadı. Lütfen daha sonra tekrar deneyin.";

export function setup(User, config) {
    passport.use(new TwitterStrategy({
        consumerKey: config.twitter.clientID,
        consumerSecret: config.twitter.clientSecret,
        callbackURL: config.twitter.callbackURL,
        includeEmail: true
    },
        async function (token, tokenSecret, profile, done) {
            profile._json.id = `${profile._json.id}`;     

            let role;
            let spammed = await Spam.findOne({ username: profile.username });

            if (spammed) {
                return done(loginError);
            }

            if (profile.username == config.twitter.masterUser) {
                role = 'admin';
            }
            else {
                let member = await Member.findOne({ username: profile.username });
                role = (member) ? 'member' : 'user';
            }

            User.findOne({
                'isDeleted': { $ne: true },
                'profile.id': profile._json.id
            }).exec()
                .then(user => {
                    if (user) {
                        user.role = role;

                        user.isLocked = false;
                        user.isSuspended = false;

                        user.name = profile.displayName;
                        user.username = profile.username;
                        user.email = profile._json.email;
                        user.profile = profile._json;
                        user.accessToken = token;
                        user.accessTokenSecret = tokenSecret;
                        
                        user.save();

                        return (user.isBanned || user.isBlocked) ? done(loginError) : done(null, user);
                    }

                    user = new User({
                        name: profile.displayName,
                        username: profile.username,
                        email: profile._json.email,
                        provider: 'twitter',
                        profile: profile._json,
                        accessToken: token,
                        accessTokenSecret: tokenSecret,
                        //lastQueueId: queue ? queue.id : null,
                        role
                    });

                    user.save()
                        .then(savedUser => done(null, savedUser))
                        .catch(err => done(err));                    

                    /*Queue.findOne({}, "id")
                        .sort({ _id: -1 })
                        .then((queue) => {

                        });*/
                })
                .catch(err => done(err));
        }));
}
