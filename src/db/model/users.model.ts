import mongoose from 'mongoose';

let usersSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true
    },
    name : {
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
    // aes_password: {
    //     type: String,
    //     required: true
    // },
    merchantCode: String,
    walletId: String,
    isApproved: { type: Boolean, default: false },
    roles: [{
        type: String,
        required: true,
        enum: ['super-admin', 'admin']
    }],

    permissions: [{
        type: String,
        required: true,
        enum: ['maker', 'checker']
    }],
    
},{timestamps : true});

export default mongoose.model('User', usersSchema);

