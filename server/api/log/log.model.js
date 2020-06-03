/*eslint no-invalid-this:0*/
import mongoose, { Schema } from 'mongoose';

mongoose.Promise = require('bluebird');

var LogSchema = new Schema({
    username: String,
    sessionDate: Date,
    error: {}
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    },
    timestamps: true
});

LogSchema
    .virtual('user', {
        ref: 'User',
        localField: 'username',
        foreignField: 'username',
        justOne: true
    });

export default mongoose.model('Log', LogSchema);
