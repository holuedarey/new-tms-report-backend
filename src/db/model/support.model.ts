/**
 * Merchant Model
 * Stores merchants details
 */
import mongoose from 'mongoose';

let supportSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    emailAddress : {
        type : String,
        required : true
    },
    phoneNumber : {
        type : String,
        required : true
    },
    TerminalId : {
        type: String,
        required: true
    },
    merchantId: String,
    bankCode: String,
    isApproved: { type: Boolean, default: false },
  
    
},{timestamps : true});

export default mongoose.model('Support', supportSchema);
