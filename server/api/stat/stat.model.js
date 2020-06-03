/*eslint no-invalid-this:0*/
import mongoose, { Schema } from 'mongoose';

mongoose.Promise = require('bluebird');

var StatSchema = new Schema({
    sessionDate: Date,
    success: Number,
    failed: Number
});

export default mongoose.model('Stat', StatSchema);
