import mongoose from 'mongoose';

let reportsSchema = new mongoose.Schema({
    type : {
        type : String,
        required : true
    },
    data : Object
},{timestamps:true});

export default mongoose.model('Report', reportsSchema);
