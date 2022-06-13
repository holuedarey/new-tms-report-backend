import dash from 'lodash';

class Mapper {

    static authPayload(user){
        return dash.pick(user,"_id","name", "email","username","roles")
    }

    static basicProfile(user  = null){
        let picks = [
            "_id","name","email","username","roles"
        ]

        if(!user) return picks;
        
        return dash.pick(user,picks);
    }

    static terminalStatQuery(){
        return [
            {$group : {_id : "$tid", lat : {$last : "$lat"}, lon : {$last : "$lon"}, geo_addr : {$last : "$geo_addr"}, ptad : {$last : "$ptad"}, ctime : {$last : "$ctime"}, bl : {$last : "$bl"}, cs : {$last : "$cs"}, ps : {$last : "$ps"},ss : {$last : "$ss"}, mid : {$last : "$mid"}, sim : {$last : "$sim"}, tmn : {$last : "$tmn"}, tmanu : {$last : "$tmanu"}, hb : {$last : "$hb"}, sv : {$last : "$sv"}, build : {$last : "$build"}, lTxnAt : {$last : "$lTxnAt"}, coms : {$last : "$coms"}}},
            {$project : {_id : 0, terminalId :  "$_id",merchantId : "$mid",lastSeen : "$ctime",last_Transaction : "$lTxnAt",lat : "$lat",lon : "$lon",geo_addr : "$geo_addr",ptad : "$ptad",batteryLevel : "$bl",chargingStatus:"$cs",printerStatus : "$ps",simType : "$sim",terminalVersion : "$tmn",terminalManu : "$tmanu",hasBattery : "$hb",signalStrength : "$ss",build : "$build",coms: "$coms",softwareVersion : "$sv"}},
            // {$limit : 200}
        ]
    }

}

export default Mapper;