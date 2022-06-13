import mongoose from 'mongoose';

const terminalKeysSchema = new mongoose.Schema({
    terminalId : {
        type : String,
        require : true
    },
    walletId: {type: String, default: null },
    enabled: Boolean,
    serialNumber: { type: String, default: null },
    firmwareVerion: String,
    organisationName: String,
    organizationNotificationId:  { type: String, default: 'paysure' },
    defaultLogo: Boolean,
    installationDate: Date,
    physicalAddress: String,
    postalAddress: String,
    phone: String,
    email: String,
    applicationVersion: String,
    terminalModel: String,
    applicationName: String,
    imei: String,
    primaryHost: String, // EPMS || POSVAS
    merchantCode: { type: String, default: null },
    receiptAddress: { type: String, default: null },
    downloadStatus: String, // Priority || Standard
    canDoAgencyBanking: Boolean,
    canDoPurchase: Boolean,
    reasonNoTID: String,
    block:{ type: Boolean, default: false },

},{ timestamps: true });


export default mongoose.model('TerminalConfig', terminalKeysSchema);


// 2021passbizzCertKey$3CUR3