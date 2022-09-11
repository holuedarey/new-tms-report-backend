import mongoose, { mongo } from 'mongoose';

let updateSchema = new mongoose.Schema({
    version: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    fix: {
        type: String,
        required: false
    },
    specific_terminals: {
        type: Boolean,
        default: false
    },
    terminals: [{
        type: String
    }],
    remarks: {
        type: String
    },
    path: {
        type: String,
        required: true
    },
    uploader_id: [{}]


}, { timestamps: true });

export default mongoose.model('Update', updateSchema);

