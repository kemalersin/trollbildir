/*eslint no-invalid-this:0*/
import mongoose, { Schema } from 'mongoose';

mongoose.Promise = require('bluebird');

var QueueSchema = new Schema({
    username: String,
    spamId: Schema.ObjectId
}, { timestamps: true });

export default mongoose.model('Queue', QueueSchema);
