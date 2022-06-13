import mongoose from "mongoose";

let notificationServiceSchema = new mongoose.Schema({

    name: String,
    url: String,
    parameters: JSON,
    key: String,
    reversalUrl: String,
    acquirer:String,
    notificationClass: String,
    authorizationToken: String,
    enabled: Boolean

}, { timestamps : true});

export default mongoose.model('NotificationService', notificationServiceSchema);
