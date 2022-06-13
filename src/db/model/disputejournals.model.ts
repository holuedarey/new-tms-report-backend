import mongoose from "mongoose";

let disputeJournalSchema = new mongoose.Schema({
    ticketId: { type: String },
    transactionType: { type: String, default: "Purchase" },
    transactionAmount: { type: Number},
    ptspTransactionDetails: {type: Object, default : null}, // rrn, terminalId, maskedPan, STAN, amount
    vasTransactionDetails: { type: Object, default: null }, // transactionId, sessionId, amount

}, {timestamps : true});

export default mongoose.model('DisputeJournals', disputeJournalSchema);
