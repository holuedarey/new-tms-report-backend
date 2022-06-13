import mongoose from 'mongoose';

let hostConfigSchema = new mongoose.Schema({
    hostip: String,
    hostport_ssl: String,
    hostport_plain: String,
    nibssip: String,
    nibssport_plain: String,
    nibssport_ssl: String,
    hostname: String,
    swkcomp1: String,
    swkcomp2: String,
    xorcomp1_2: String
},{timestamps : true});

export default mongoose.model('HostConfig', hostConfigSchema);
