/*eslint no-invalid-this:0*/
import mongoose, { Schema } from 'mongoose';

mongoose.Promise = require('bluebird');

var UserSchema = new Schema({
    name: String,
    username: String,
    email: String,
    isLocked: {
        type: Boolean,
        default: false
    },    
    isSuspended: {
        type: Boolean,
        default: false
    },  
    tokenExpired: {
        type: Boolean,
        default: false
    },     
    role: {
        type: String,
        default: 'user'
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

export default mongoose.model('User', UserSchema);
