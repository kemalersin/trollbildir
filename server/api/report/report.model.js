/*eslint no-invalid-this:0*/
import mongoose, { Schema } from 'mongoose';

mongoose.Promise = require('bluebird');

var ReportSchema = new Schema({
    username: String,
    notes: String,
    picture: String, 
    reportedBy: String, 
    reporter: {
        type: Schema.ObjectId,
        ref: 'User'
    },     
    isApproved: {
        type: Boolean,
        default: null
    },
    profile: {}
}, { timestamps: true });

export default mongoose.model('Report', ReportSchema);
