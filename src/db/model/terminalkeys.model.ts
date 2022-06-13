import mongoose from 'mongoose';

const terminalKeysSchema = new mongoose.Schema({
    terminalId : {
        type : String,
        require : true
    },
    
    // required for nibss
    masterKey_1 : String,
    masterKey_2 : String,
    pinKey_1 : String,
    pinKey_2 : String,
    sessionKey_1 : String,
    sessionKey_2 : String,

    // required for tams
    batchNo : {
        type : Number,
        default : 0
    },
    sequenceNumber : {
        type :Number,
        default : 0
    },
    masterKey_tams : String,
    sessionKey_tams0 : String,
    sessionKey_tams1 : String,
    sessionKey_tams2 : String,
    mechantID_tams: String,
    countryCode_tams : String,

    // required for interswitch
    is_TERMINAL_KEY : String,
    is_KEY_ALIAS : String,
    nibss_merchantId : String,
    terminal_imei : String,

    /**
     * TMK : string,
     * TSK : string,
     * TPK : string
     * PARAM : object
    */
    upslKey : {
        type : Object,
        default : null
    }


},{ timestamps: true });


export default mongoose.model('TerminalKey', terminalKeysSchema);
