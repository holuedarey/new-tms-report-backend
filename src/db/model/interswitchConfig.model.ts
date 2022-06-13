import mongoose from 'mongoose';

let interswitchSchema = new mongoose.Schema({
    pinKey : {
        type : String,
        required: true
    },
    keyCheck : String,
    sequence : {
        type : Number,
        default : 0
    }
},{timestamps : true});

module.exports = interswitchSchema;

export default mongoose.model('InterswitchConfig', interswitchSchema);
