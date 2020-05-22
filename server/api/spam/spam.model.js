/*eslint no-invalid-this:0*/
import mongoose, { Schema } from 'mongoose';

mongoose.Promise = require('bluebird');

var SpamSchema = new Schema({
    username: String,
    profile: {}
}, { timestamps: true });

export default mongoose.model('Spam', SpamSchema);
