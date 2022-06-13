import mongoose from "mongoose";

let registeredNotification = new mongoose.Schema({

    name: {
        type: String,
        unique: true
    },
    merchantId: {
        type: String,
        default: ''
    },
    terminalId:  {
        type: String,
        default: ''
    },
    identifier : {
        type : String,
        default : ''
    },
    notificationService: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NotificationService",
    },
    enabled: Boolean,
    selectors : [String]
});


export default mongoose.model('RegisteredNotification', registeredNotification);
