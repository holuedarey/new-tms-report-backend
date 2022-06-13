import mongoose from 'mongoose';

let usersSchema = new mongoose.Schema({
    username : {
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
    password : {
        type: String,
        required: true
    },
    aes_password: {
        type: String,
        required: true
    },
    merchantCode: String,
    walletId: String,
    roles: [{
        type: String,
        required: true,
    }],
    
},{timestamps : true});

export default mongoose.model('User', usersSchema);

