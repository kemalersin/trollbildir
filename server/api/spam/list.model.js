/*eslint no-invalid-this:0*/
import mongoose, { Schema } from 'mongoose';

mongoose.Promise = require('bluebird');

var ListSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    spam: {
        type: Schema.ObjectId,
        ref: 'Spam'
    },   
    type: {
        type: Number,
        default: 1
    },    
}, { timestamps: true });

export default mongoose.model('List', ListSchema);