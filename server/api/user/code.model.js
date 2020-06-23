import mongoose, { Schema } from 'mongoose';

var CodeSchema = new mongoose.Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    type: {
        type: Number,
        default: 2
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    randomStr: String
}, { timestamps: true });

export default mongoose.model('Code', CodeSchema);
