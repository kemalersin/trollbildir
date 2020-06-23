/*eslint no-invalid-this:0*/
import crypto from 'crypto';
import mongoose, { Schema } from 'mongoose';

mongoose.Promise = require('bluebird');

var UserSchema = new Schema({
    name: String,
    username: String,
    role: {
        type: String,
        default: 'user'
    },
    email: {
        type: String,
        lowercase: true
    },
    password: String,
    provider: String,
    salt: String,
    oldUsernames: [String],
    isBanned: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    tokenExpired: {
        type: Boolean,
        default: false
    },
    profile: {},
    accessToken: String,
    accessTokenSecret: String,
    lastQueueId: {
        type: Schema.ObjectId,
        default: null
    }
}, { timestamps: true });

UserSchema
    .virtual('identity')
    .get(function () {
        return {
            name: this.name,
            role: this.role
        };
    });

UserSchema
    .virtual('token')
    .get(function () {
        return {
            _id: this._id,
            role: this.role
        };
    });

UserSchema
    .path('email')
    .validate(function (email) {
        return email.length;
    }, 'E-posta boş olamaz.');

UserSchema
    .path('password')
    .validate(function (password) {
        return password.length;
    }, 'Parola boş olamaz.');

UserSchema
    .path('email')
    .validate(function (value) {
        return this.constructor.findOne({ email: value }).exec()
            .then(user => {
                if (user) {
                    if (this.id === user.id) {
                        return true;
                    }
                    return false;
                }
                return true;
            })
            .catch(err => {
                throw err;
            });
    }, 'E-posta adresi kullanılıyor.');

var validatePresenceOf = function (value) {
    return value && value.length;
};

UserSchema
    .pre('save', function (next) {
        if (!this.isModified('password')) {
            return next();
        }

        if (!validatePresenceOf(this.password)) {
            return next(new Error('Hatalı parola.'));
        }

        this.makeSalt((saltErr, salt) => {
            if (saltErr) {
                return next(saltErr);
            }
            this.salt = salt;
            this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
                if (encryptErr) {
                    return next(encryptErr);
                }
                this.password = hashedPassword;
                return next();
            });
        });
    });

UserSchema.methods = {
    authenticate(password, callback) {
        if (!callback) {
            return this.password === this.encryptPassword(password);
        }

        this.encryptPassword(password, (err, pwdGen) => {
            if (err) {
                return callback(err);
            }

            if (this.password === pwdGen) {
                return callback(null, true);
            } else {
                return callback(null, false);
            }
        });
    },

    makeSalt(...args) {
        var defaultByteSize = 16;
        let byteSize;
        let callback;

        if (typeof args[0] === 'function') {
            callback = args[0];
            byteSize = defaultByteSize;
        } else if (typeof args[1] === 'function') {
            callback = args[1];
        } else {
            throw new Error('Eksik çağrı.');
        }

        if (!byteSize) {
            byteSize = defaultByteSize;
        }

        return crypto.randomBytes(byteSize, (err, salt) => {
            if (err) {
                return callback(err);
            } else {
                return callback(null, salt.toString('base64'));
            }
        });
    },

    encryptPassword(password, callback) {
        if (!password || !this.salt) {
            if (!callback) {
                return null;
            } else {
                return callback('Eksik parola ya da anahtar.');
            }
        }

        var defaultIterations = 10000;
        var defaultKeyLength = 64;
        var salt = Buffer.from(this.salt, 'base64');

        if (!callback) {
            return crypto.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, 'sha256')
                .toString('base64');
        }

        return crypto.pbkdf2(password, salt, defaultIterations, defaultKeyLength, 'sha256', (err, key) => {
            if (err) {
                return callback(err);
            } else {
                return callback(null, key.toString('base64'));
            }
        });
    }
};

export default mongoose.model('User', UserSchema);
