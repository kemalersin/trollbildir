/*eslint no-invalid-this:0*/
import mongoose, { Schema } from 'mongoose';

mongoose.Promise = require('bluebird');

var SpamSchema = new Schema({
    username: String,
    isDeleted: {
        type: Boolean,
        default: false
    },
    isNotFound: {
        type: Boolean,
        default: false
    },
    isSuspended: {
        type: Boolean,
        default: false
    },    
    profile: {}
}, { timestamps: true });

export default mongoose.model('Spam', SpamSchema);
