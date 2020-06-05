/*eslint no-invalid-this:0*/
import mongoose, { Schema } from 'mongoose';

mongoose.Promise = require('bluebird');

var FlagSchema = new Schema({
    spaming: {
        started: Boolean,
        startDate: Date,
        finishDate: Date
    }
}, { timestamps: true });

export default mongoose.model('Flag', FlagSchema);
