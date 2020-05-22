/*eslint no-invalid-this:0*/
import mongoose, { Schema } from 'mongoose';

mongoose.Promise = require('bluebird');

var MemberSchema = new Schema({
    username: String,
    profile: {}
}, { timestamps: true });

export default mongoose.model('Member', MemberSchema);
