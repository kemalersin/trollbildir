/*eslint no-invalid-this:0*/
import mongoose, { Schema } from 'mongoose';
import { registerEvents } from './user.events';

mongoose.Promise = require('bluebird');

var UserSchema = new Schema({
    name: String,
    username: String,
    email: String,
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

registerEvents(UserSchema);
export default mongoose.model('User', UserSchema);
