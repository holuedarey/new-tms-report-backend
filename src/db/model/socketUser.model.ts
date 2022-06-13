import mongoose from 'mongoose';

const SocketUserSchema = new mongoose.Schema({
    token : String,
    socketId : String,
    connected : {
        type : Boolean,
        default : false
    }
},{timestamps : true});


module.exports = SocketUserSchema;

export default mongoose.model('SocketUser',SocketUserSchema,'socketUsers');



