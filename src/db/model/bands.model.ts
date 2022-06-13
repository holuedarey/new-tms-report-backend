import mongoose  from 'mongoose';

const bandsSchema = new mongoose.Schema({
    terminalId : {
        type : String,
        unique : true
    },
    merchantId  : String,
    merchantName : String,
    group  : String,
    volumeChange: {type : Number, default : 0},
    amountChange:  {type : Number, default : 0},
    weekAmount : {type : Number, default : 0},
    weekVolume  : {type : Number, default : 0},
    transactions : Array
},{timestamps : true});

export default mongoose.model('Band', bandsSchema);
