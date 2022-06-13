import mongoose from "mongoose";

let journalSchema = new mongoose.Schema({

    rrn: String,
    failOverRrn : String,
    oldResCode : String,
    responseCode: String,
    onlinePin: Boolean,
    amount: Number,
    currencyCode: String,
    merchantName: String,
    TVR : String,
    CRIM : String,
    merchantAddress: String,
    merchantId: String,
    terminalId: String,
    STAN: String,
    authCode: String,
    transactionTime: Date,
    handlerResponseTime: Date,
    processTime: Date,
    merchantCategoryCode: String,
    handlerName: String,
    handler: String,
    handlerUsed : String,
    MTI: String,
    maskedPan: String,
    cardName: String,
    cardExpiry: String,
    processingCode: String,
    messageReason:  String,
    script : String,
    originalDataElements:  String,
    customerRef : String,
    notified : String,
    pfmNotified : String,
    customTransactionId: String,
    merchant : Object,
    write2pos : {
        type : String
    },
    FIIC : String,

    interSwitchResponse : String,
    upslResponse : String,

    vasData : {type: Object, default : null},
    transactionType: { type: String, default: "Purchase" },
    vasproduct: {type: String},
    merchantCode: {type: String},
    terminalApplicationVersion: String,
    terminalModel: String,
    logoUrl: String

});

export default mongoose.model('Journal', journalSchema);
