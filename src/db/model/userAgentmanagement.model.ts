import mongoose from 'mongoose';

let userAgentManagemntSchema = new mongoose.Schema({
 
    username: {type: String, default : ''},
    password: {type: String, default : ''},
    transactionPin: {type: String, default : ''},
    walletId: String,
    agentName: {type: String, default : ''},
    contactPersonName: {type: String, default : ''},
    parentCode: {type: String, default : ''},
    phoneNumber: {type: String, default : ''},
    emailAddress: {type: String, default : ''},
    logoUrl: {type: String, default : ''},
    addressLine1: {type: String, default : ''},
    addressLine2: {type: String, default : ''},
    state: {type: String, default : ''},
    lga: {type: String, default : ''},
    city: {type: String, default : ''},
    bandName: {type: String, default : ''},
    organisationCode: {type: String, default : ''},
    noOfTerminalOnSignUp: { type: String, default: ''},
    userType: { type: String, default: '' },
    isApproved: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('userAgentManagemnt', userAgentManagemntSchema);
