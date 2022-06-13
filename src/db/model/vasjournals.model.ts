import mongoose from 'mongoose';

let vasJournalsSchema = new mongoose.Schema({
 
    amount: Number,
    beneficiaryNumber: { type: String, default: ""},
    beneficiaryName: { type: String, default: ""},
    senderName: { type: String, default: ""},
    senderNumber: { type: String, default: ""},
    merchantCode: { type: String, default: ""},
    channel: { type: String, default: ""},
    encryptedData: { type: String, default: ""},
    product: { type: String, default: "" },
    walletId:{ type: String, default: ""},
    commission: Number, 
    transactionTime: Date,
    handlerResponseTime: Date,
    extraFields: JSON,
    responseCode: { type: String, default: ""},
    responseMessage: { type: String, default: ""},
    isCompleted: Boolean,
    transactionId: {type: String, default: ""},
    providerName: {type: String, default: ""},
    sessionId: {type: String, default: ""},
    providerStatusMessage: {type: String, default: ""},
    providerReference: {type: String, default: ""},
    merchantCommission: {type: String, default: ""},
    transactionType: {type: String, default: ""},
    transactionElapse: {type: String, default: ""}


});

export default mongoose.model('VasJournal', vasJournalsSchema);
