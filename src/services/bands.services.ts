
import BandsModel from '../db/model/bands.model';
import moment from 'moment-timezone';
import Util from '../helpers/utils';
import MerchantSummary from '../db/model/merchantSummary.model';
import Merchant from '../db/model/merchant.model';
import { threshold, weekThreshold, dateGroup} from '../helpers/constants';


class BandsServices {


    public async getBandTerminalCount(filter: any){

        let band = filter.band.toUpperCase();

        let bands = await BandsModel.aggregate([
            {$match : {group : band}},
            {$count :'count'}
        ]).allowDiskUse(true).read("secondary");

        return {
            count : bands[0].count
        };
    }

    public async getBandTerminalReport(filter: any){

        let band = filter.band.toUpperCase();

        let match: any = {group : band};

        if(filter.terminalId){
            let len = filter.terminalId.length;
            if(len < 8){
                match.terminalId =  {$regex: filter.terminalId};
            }else{
                match.terminalId =  filter.terminalId.trim();
            } 
        }

        if(filter.merchant){
            match.merchantId = filter.merchant 
        }

        

        filter = Util.setPaging(filter);

        let bands = await BandsModel.aggregate([
            {$match : match},
            {$skip : filter.skip},
            {$limit : filter.pageSize}
        ]).allowDiskUse(true).read("secondary");

        bands = await this.appendMerchantInfo(bands);

        return bands;
    }

    public async getBandOnTargetTerminalCount(filter: any){

        let band = filter.band.toUpperCase();

        let thresholdcheck = threshold[band];

        let yesterday =  moment().tz("Africa/Lagos").subtract(1,"day").format("YYYY-MM-DD");

        let start = new Date(yesterday);
        // let end = yesterday.endOf("day").toDate();

        console.log(start);
        // console.log(end);

        let bands = await BandsModel.aggregate([
            {$match : {group : band}},
            {$project : {terminalId : 1,transaction : {$arrayElemAt : ["$transactions", -1]}}},
            {$match : {"transaction.amount" : {$gte : thresholdcheck },"transaction.date": start}},
            {$count : 'count'}
        ]).allowDiskUse(true).read("secondary");
        
        let count = 0;
        if(bands.length){
            count = bands[0].count
        }
        return {
            count : count
        };
    }
    
    public async getBandOnTargetTerminalCountWeekly(filter: any){
        
        let band = filter.band.toUpperCase();

        let threshold = weekThreshold[band];

        let bands = await BandsModel.aggregate([
            {$match : {group : band,weekAmount  : {$gte : threshold}}},
            {$count : 'count'}
        ]).allowDiskUse(true).read("secondary");

        let count = 0;
        if(bands.length){
            count = bands[0].count
        }
        return {
            count : count
        };

    }

    public async getBandOffTargetTerminalCount(filter: any){

        let band = filter.band.toUpperCase();

        let thresholdcheck = threshold[band];

        let yesterday =  moment().tz("Africa/Lagos").subtract(1,"day").format("YYYY-MM-DD");

        let start = new Date(yesterday);

        let bands = await BandsModel.aggregate([
            {$match : {group : band}},
            {$project : {_id : 0,terminalId : 1,transaction : {$arrayElemAt : ["$transactions", -1]}}},
            {$match : {$or : [{"transaction.amount" : {$lt : thresholdcheck},"transaction.date": {$eq : start}},{"transaction.date": {$ne : start}}]}},
            {$count : 'count'}
        ]).allowDiskUse(true).read("secondary");

        let count = 0;
        if(bands.length){
            count = bands[0].count
        }
        return {
            count : count
        };
    }

    public async getBandOffTargetTerminalCountWeekly(filter: any){
        
        let band = filter.band.toUpperCase();

        let threshold = weekThreshold[band];

        let bands = await BandsModel.aggregate([
            {$match : {group : band,weekAmount  : {$lte : threshold}}},
            {$count : 'count'}
        ]).allowDiskUse(true).read("secondary");

        let count = 0;
        if(bands.length){
            count = bands[0].count
        }
        return {
            count : count
        };

    }


    public async bandAdayMonitorCount(filter: any){
        let band = (filter.band || "a").toUpperCase();

        let bandAterminals = await BandsModel.find({group :band},["terminalId","merchantId"]);

        let mappedTids = bandAterminals.map((t: any)=>{
            return t.terminalId
        });

        let start = moment().startOf("day").toDate();

        let transactions = await MerchantSummary.aggregate([
            {$match : {statusCode : "00",terminalId : {$in : mappedTids}, createdAt : {$gte : start}}},
            {$group : {_id : {terminalId : "$terminalId", day : {$dayOfMonth :{date :  "$createdAt",timezone: "Africa/Lagos"}},month : {$month : {date :"$createdAt",timezone: "Africa/Lagos"}},year : {$year :{date:"$createdAt",timezone: "Africa/Lagos"}}}, totalAmount : {$sum : "$totalAmount"}, totalVolume : {$sum : "$transactionCount"} }},
            {$project : {_id : 0,terminalId : "$_id.terminalId", date : {$dateFromParts : {'year' : "$_id.year",'month' : "$_id.month",'day': "$_id.day"} },amount : "$totalAmount",volume : "$totalVolume"}}
        ]).allowDiskUse(true).read("secondary");


        let mappedData = bandAterminals.map((t: any)=>{
            let trans = transactions.find((c: any)=>c.terminalId == t.terminalId);
            if(trans){
                return {
                    terminalId : t.terminalId,
                    merchantId : t.merchantId,
                    amount : trans.amount,
                    volume : trans.volume
                }
            }else{
                return {
                    terminalId : t.terminalId,
                    merchantId : t.merchantId,
                    amount : 0,
                    volume : 0
                };
            }
        })

        let report = mappedData.filter(c=>c.volume <= process.env.midDay );
        

        let res = {
            band : band,
            count : report.length,
            time : new Date()
        }
        
        return res;

    }

    public async bandAdayMonitor(filter: any){
        let band = (filter.band || "a").toUpperCase();

        let bandAterminals = await BandsModel.find({group :band},["terminalId","merchantId"]);

        let mappedTids = bandAterminals.map((t: any)=>{
            return t.terminalId
        });

        let start = moment().startOf("day").toDate();

        let transactions = await MerchantSummary.aggregate([
            {$match : {statusCode : "00",terminalId : {$in : mappedTids}, createdAt : {$gte : start}}},
            {$group : {_id : {terminalId : "$terminalId", day : {$dayOfMonth :{date :  "$createdAt",timezone: "Africa/Lagos"}},month : {$month : {date :"$createdAt",timezone: "Africa/Lagos"}},year : {$year :{date:"$createdAt",timezone: "Africa/Lagos"}}}, totalAmount : {$sum : "$totalAmount"}, totalVolume : {$sum : "$transactionCount"} }},
            {$project : {_id : 0,terminalId : "$_id.terminalId", date : {$dateFromParts : {'year' : "$_id.year",'month' : "$_id.month",'day': "$_id.day"} },amount : "$totalAmount",volume : "$totalVolume"}}
        ]).allowDiskUse(true).read("secondary");


        let mappedData = bandAterminals.map((t: any)=>{
            let trans = transactions.find((c: any)=>c.terminalId == t.terminalId);
            if(trans){
                return {
                    terminalId : t.terminalId,
                    merchantId : t.merchantId,
                    amount : trans.amount,
                    volume : trans.volume,
                    time : new Date()
                }
            }else{
                return {
                    terminalId : t.terminalId,
                    merchantId : t.merchantId,
                    amount : 0,
                    volume : 0,
                    time : new Date()
                };
            }
        })

        let report = mappedData.filter((c: any)=>c.volume <= process.env.midDay );

        report = report.sort((a,b)=>{
            return a.volume - b.volume
        });
        

        let attchMerch = await this.appendMerchantInfo(report);
        
        return attchMerch;

    }





    
    /**
     * 
     * @param {String} band generate  daily report  for bands  A|B
     */
    // static async monitorBandDaily(band,day = 1){
    //     let thresholdcheck = threshold[band];
    //     let bandAterminals = await BandsModel.aggregate([
    //         {$match : {group: band}}
    //     ]).allowDiskUse(true).read("secondary");


    //     let yesterday =  moment().tz("Africa/Lagos").subtract(day,"day");
    //     let start = yesterday.startOf("day").toDate();
    //     let end = yesterday.endOf("day").toDate();

    //     let belowExpected = [];
    //     let noTransaction = [];

    //     for (let i = 0; i < bandAterminals.length; i++) {
    //         const tm = bandAterminals[i];
    //         console.log(`${i+1} out of ${bandAterminals.length}, TID: ${tm.terminalId}`)
    //         let summary = [];
    //         if(tm.transactions.length){

    //             let last = tm.transactions[tm.transactions.length - 1];

    //             start = moment(last.date).tz("Africa/Lagos").endOf("day").toDate();

    //             summary = await MerchantSummary.aggregate([
    //                 {$match : {statusCode : "00",terminalId : tm.terminalId, createdAt : {$gt : start, $lt : end}}},
    //                 {$sort : {createdAt : 1}},
    //                 {$group : {_id : {day : {$dayOfMonth :{date :  "$createdAt",timezone: "Africa/Lagos"}},month : {$month : {date :"$createdAt",timezone: "Africa/Lagos"}},year : {$year :{date:"$createdAt",timezone: "Africa/Lagos"}}}, totalAmount : {$sum : "$totalAmount"}, totalVolume : {$sum : "$transactionCount"} }},
    //                 {$project : {_id : 0, date : {$dateFromParts : {'year' : "$_id.year",'month' : "$_id.month",'day': "$_id.day"} },amount : "$totalAmount",volume : "$totalVolume"}},
    //             ]).allowDiskUse(true).read("secondary");

                

    //         }else{

    //             summary = await MerchantSummary.aggregate([
    //                 {$match : {statusCode : "00",terminalId : tm.terminalId, createdAt : {$lt : end}}},
    //                 {$sort : {createdAt : 1}},
    //                 {$group : {_id : {day : {$dayOfMonth :{date :  "$createdAt",timezone: "Africa/Lagos"}},month : {$month : {date :"$createdAt",timezone: "Africa/Lagos"}},year : {$year :{date:"$createdAt",timezone: "Africa/Lagos"}}}, totalAmount : {$sum : "$totalAmount"}, totalVolume : {$sum : "$transactionCount"} }},
    //                 {$project : {_id : 0, date : {$dateFromParts : {'year' : "$_id.year",'month' : "$_id.month",'day': "$_id.day"} },amount : "$totalAmount",volume : "$totalVolume"}},
    //             ]).allowDiskUse(true).read("secondary");                  
    //         }

    //         summary.sort((a,b)=>{
    //             return moment(a.date).diff(b.date,"day")
    //         });

    //         summary.forEach(e=>{
    //             tm.transactions.push(e);
    //         });

    //         while(tm.transactions.length > 22)tm.transactions.shift();

    //         await BandsModel.updateOne({terminalId : tm.terminalId}, tm);

    //         let yesterdaySummary = tm.transactions.find(c=>moment(c.date).tz("Africa/Lagos").startOf("day").toDate() >= yesterday.startOf("day").toDate());
    //         console.log(JSON.stringify(yesterdaySummary))
    //         if(!yesterdaySummary){
    //             noTransaction.push(tm);
    //             let trans = {
    //                 amount : 0,
    //                 volume : 0,
    //                 date : new Date(moment().subtract(day,"day").format('YYYY-MM-DD'))
    //             }
    //             await BandsModel.updateOne({terminalId : tm.terminalId},{$push : {transactions : trans}});
    //         } 
    //         else{
    //             if(yesterdaySummary.amount < threshold){
    //                 belowExpected.push(tm);
    //             } 
    //         }

    //     }

    //     let files = [];
    //     if(belowExpected.length){
    //         let file = await Util.generateForBandExcel(belowExpected,"below-expected-report",band,false,day);
    //         if(file)files.push(file);
    //     }

    //     if(noTransaction.length){
    //         let file = await  Util.generateForBandExcel(noTransaction,"zero-transaction-report",band,true,day);
    //         if(file)files.push(file);
    //     }
            
    //     let info = await EmailService.SendBandReport(files,band,day);
    //     return info;
      
    // }

    /**
     * generate daily report for  other  bands
     */
    public async monitorOtherBands(day = 1){

        let relevantBands = await BandsModel.aggregate([
            {$match : {group : {$in: ["A","B"]}}}
        ]).allowDiskUse(true).read("secondary");

        let relevantTids = relevantBands.map(tm=>{
            return tm.terminalId
        });

        let yesterday =  moment().tz("Africa/Lagos").subtract(day,"day");
        let start = yesterday.startOf("day").toDate();
        let end = yesterday.endOf("day").toDate();

        console.log(relevantBands.length)

        let otherTIds = await MerchantSummary.aggregate([
            {$match : {terminalId : {$nin : relevantTids,$exists: true}}},
            {$group : {_id : {terminalId : "$terminalId",merchantId : "$merchantId"}}},
            {$project : {_id : 0,terminalId : "$_id.terminalId",merchantId : "$_id.merchantId"}}
        ]).allowDiskUse(true).read("secondary");

        console.log(otherTIds.length)

        let otherBandsData = await BandsModel.aggregate([{$match : {group : "C"}}]).allowDiskUse(true).read("secondary");

        console.log(otherBandsData.length);

        for (let i = 9706; i < otherTIds.length; i++) {
            let tm = otherTIds[i];
            tm.transactions = [];

            let bandRecord = otherBandsData.find(c=>c.terminalId == tm.terminalId);
            console.log(`\n bfore data : ${JSON.stringify(tm)}\n\n`);
            if(bandRecord){
                Object.assign(tm,bandRecord);
                console.log(`\n data : ${JSON.stringify(tm)}\n\n`);
            }

            console.log(`${i+1} out of ${otherTIds.length}, TID: ${tm.terminalId} \n`);

            // console.log(` TID: ${JSON.stringify(tm)} \n`);

            let summary = [];
            if(tm.transactions.length){

                let last = tm.transactions[tm.transactions.length - 1];

                start = moment(last.date).tz("Africa/Lagos").endOf("day").toDate();

                summary = await MerchantSummary.aggregate([
                    {$match : {statusCode : "00",terminalId : tm.terminalId, createdAt : {$gt : start, $lt : end}}},
                    {$sort : {createdAt : 1}},
                    {$group : {_id : {day : {$dayOfMonth :{date :  "$createdAt",timezone: "Africa/Lagos"}},month : {$month : {date :"$createdAt",timezone: "Africa/Lagos"}},year : {$year :{date:"$createdAt",timezone: "Africa/Lagos"}}}, totalAmount : {$sum : "$totalAmount"}, totalVolume : {$sum : "$transactionCount"} }},
                    {$project : {_id : 0, date : {$dateFromParts : {'year' : "$_id.year",'month' : "$_id.month",'day': "$_id.day"} },amount : "$totalAmount",volume : "$totalVolume"}},
                ]).allowDiskUse(true).read("secondary");

            }else{

                summary = await MerchantSummary.aggregate([
                    {$match : {statusCode : "00",terminalId : tm.terminalId, createdAt : {$lt : end}}},
                    {$sort : {createdAt : 1}},
                    {$group : {_id : {day : {$dayOfMonth :{date :  "$createdAt",timezone: "Africa/Lagos"}},month : {$month : {date :"$createdAt",timezone: "Africa/Lagos"}},year : {$year :{date:"$createdAt",timezone: "Africa/Lagos"}}}, totalAmount : {$sum : "$totalAmount"}, totalVolume : {$sum : "$transactionCount"} }},
                    {$project : {_id : 0, date : {$dateFromParts : {'year' : "$_id.year",'month' : "$_id.month",'day': "$_id.day"} },amount : "$totalAmount",volume : "$totalVolume"}},
                ]).allowDiskUse(true).read("secondary");                 
            }

            summary.sort((a,b)=>{
                return moment(a.date).diff(b.date,"day")
            });

            summary.forEach(e=>{
                tm.transactions.push(e);
            });

            let yesterdaySummary = tm.transactions.find(c=>moment(c.date).tz("Africa/Lagos").startOf("day").toDate() >= yesterday.startOf("day").toDate());
            if(!yesterdaySummary){
                let trans = {
                    amount : 0,
                    volume : 0,
                    date : new Date(moment().subtract(day,"day").format('YYYY-MM-DD'))
                }
                tm.transactions.push(trans);
            }


            while(tm.transactions.length > 22)tm.transactions.shift();


            if(!tm._id){
                tm.group  = "C";
            }

            await BandsModel.updateOne({terminalId : tm.terminalId}, tm,{upsert : true});
        }

    }

    /**
     * generate weekly report
     * @param {String} band band string A|B|C
     */
    // static async weeklyReport(band,day=1){
        
    //     let terminals = await BandsModel.aggregate([
    //        {$match : {group : band}}
    //     ]).allowDiskUse(true).read("secondary");

    //     let reportData = [];

    //     let yesterday =  moment().tz("Africa/Lagos").subtract(day,"day");
    //     let start = yesterday.startOf("week").toDate();
    //     let end = yesterday.endOf("week").toDate();

    //     for (let i = 0; i < terminals.length; i++) {

    //         const tm = terminals[i];

    //         let lastWeek = tm.transactions.filter(c=>moment(c.date).tz("Africa/Lagos").startOf("day").toDate() >= start && c.date <= end) || [];

    //         let totalAmount = Util.sumObjectProp(lastWeek,"amount") + Util.sumObjectProp(lastWeek, "totalAmount");
    //         let totalVolume = Util.sumObjectProp(lastWeek,"volume") + Util.sumObjectProp(lastWeek, "totalVolume");;

    //         let lastAmount = tm.weekAmount || 0;
    //         let lastvolume = tm.weekVolume || 0;

    //         let amountChange = ((totalAmount - lastAmount) * 100)/totalAmount;
    //         let volumeChange = ((totalVolume - lastvolume) * 100)/totalVolume;
            
    //         console.log(`all data : ${JSON.stringify(tm.transactions)}, \n \n weekly :  ${JSON.stringify(lastWeek)} \n \n`)

    //         tm.volumeChange = volumeChange || 0;
    //         tm.amountChange = amountChange || 0;
    //         tm.weekAmount = totalAmount || 0;
    //         tm.weekVolume  = totalVolume  || 0;

    //         console.log(`tm : ${JSON.stringify(tm)} \n \n`);

    //         await BandsModel.updateOne({terminalId : tm.terminalId},tm);

    //         reportData.push(tm);
    //     }

    //     let files = [];
    //     if(reportData.length){
    //         let file = await Util.generateForBandExcelWeekly(reportData,"weekly-report",band,false,day);
    //         if(file)files.push(file);
    //     } 

    //     let info = await EmailService.SendBandWeeklyReport(files,band,day);
    //     return info;
    // }

    /**
     * update report for  band C and  new terminals
     */
    public async weeklyReportOthers(day=1){
        
        let terminals = await BandsModel.aggregate([
           {$match : {group : {$nin : ["A","B"]}}} 
        ]).allowDiskUse(true).read("secondary");

        let yesterday =  moment().tz("Africa/Lagos").subtract(day,"day");
        let start = yesterday.startOf("week").toDate();
        let end = yesterday.endOf("week").toDate();

        for (let i = 0; i < terminals.length; i++) {

            const tm = terminals[i];

            let lastWeek = tm.transactions.filter(c=>moment(c.date).tz("Africa/Lagos").startOf("day").toDate() >= start && moment(c.date).tz("Africa/Lagos").endOf("day").toDate() <= end) || [];

            let totalAmount = Util.sumObjectProp(lastWeek,"amount") + Util.sumObjectProp(lastWeek, "totalAmount");
            let totalVolume = Util.sumObjectProp(lastWeek,"volume") + Util.sumObjectProp(lastWeek, "totalVolume");;

            let lastAmount = tm.weekAmount || 0;
            let lastvolume = tm.weekVolume || 0;

            let amountChange = ((totalAmount - lastAmount) * 100)/totalAmount;
            let volumeChange = ((totalVolume - lastvolume) * 100)/totalVolume;
            
            // console.log(`all data : ${JSON.stringify(tm.transactions)}, \n \n weekly :  ${JSON.stringify(lastWeek)} \n \n`)
        

            tm.volumeChange = volumeChange || 0;
            tm.amountChange = amountChange || 0;
            tm.weekAmount = totalAmount || 0;
            tm.weekVolume  = totalVolume  || 0;

            // console.log(`tm : ${JSON.stringify(tm)} \n \n`);

            await BandsModel.updateOne({terminalId : tm.terminalId},tm);

        }
    }

    // for midDay
    // static async bandAdayMonitorEmail(){
    //     let bandAterminals = await BandsModel.find({group :"A"},["terminalId","merchantId"]);

    //     let mappedTids = bandAterminals.map((t: any)=>{
    //         return t.terminalId
    //     });

    //     let start = moment().startOf("day").toDate();

    //     let transactions = await MerchantSummary.aggregate([
    //         {$match : {statusCode : "00",terminalId : {$in : mappedTids}, createdAt : {$gte : start}}},
    //         {$sort : {createdAt : 1}},
    //         {$group : {_id : {terminalId : "$terminalId", day : {$dayOfMonth :{date :  "$createdAt",timezone: "Africa/Lagos"}},month : {$month : {date :"$createdAt",timezone: "Africa/Lagos"}},year : {$year :{date:"$createdAt",timezone: "Africa/Lagos"}}}, totalAmount : {$sum : "$totalAmount"}, totalVolume : {$sum : "$transactionCount"} }},
    //         {$project : {_id : 0,terminalId : "$_id.terminalId", date : {$dateFromParts : {'year' : "$_id.year",'month' : "$_id.month",'day': "$_id.day"} },amount : "$totalAmount",volume : "$totalVolume"}}
    //     ]).allowDiskUse(true).read("secondary");


    //     let mappedData = bandAterminals.map((t: any)=>{
    //         let trans = transactions.find((c: any)=>c.terminalId == t.terminalId);
    //         if(trans){
    //             return {
    //                 terminalId : t.terminalId,
    //                 merchantId : t.merchantId,
    //                 amount : trans.amount,
    //                 volume : trans.volume
    //             }
    //         }else{
    //             return {
    //                 terminalId : t.terminalId,
    //                 merchantId : t.merchantId,
    //                 amount : 0,
    //                 volume : 0
    //             };
    //         }
    //     })

    //     let report = mappedData.filter(c=>c.volume <= process.env.midDay );

    //     let files = [];
    //     if(report.length){
    //         let file = await Util.generateForExcelMidDay(report,"mid-day-report");
    //         if(file)files.push(file);
    //     } 

    //     let info = await EmailService.SendBandMidDayReport(files);
    //     return info;

    // }







    /**
     * append terminals
     * @param {*} terminals 
     */
    public async appendMerchantInfo(terminals: any[]){
        let merchantInfo = await Merchant.aggregate([
            {$match : {terminals : {$in : terminals.map((tm: any)=>{return tm.terminalId})}}}
        ]).allowDiskUse(true).read("secondary");


        let data = terminals.map((tid: any) => {
            let mInfo = merchantInfo.find((c: any)=>c.terminals.includes(tid.terminalId))
            if(mInfo){
                tid.merchantData = {
                    merchant_name : mInfo.merchant_name,
                    merchant_phone : mInfo.merchant_phone,
                    merchant_email : mInfo.merchant_email,
                    merchant_contact : mInfo.merchant_contact,
                    merchant_address : mInfo.merchant_address
                }
                tid.merchantId = mInfo.merchant_id
            }
            return tid
        });

        return data;
    }

}

export default new BandsServices();
