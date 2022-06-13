
import BankSummary from '../db/model/bankSummary.model';
import Util from '../helpers/utils';
import moment from 'moment';
import banksList from '../helpers/static-data/banks.json';

import { threshold, weekThreshold, dateGroup} from '../helpers/constants';

class BankSummaryServices {

    /**
     * get bank based transaction summary; approved || declined 
     * @param {*} filter filter from query
     */
    public async getDeclinedOrApprovedSummary(filter: any){

        let match: any = {};

        let group = {
            _id : {status :"$statusCode",statusMessage : "$messageReason"},
            totalAmount : { $sum : "$totalAmount"},
            totalVolume : {$sum : "$transactionCount"}
            
        };

        let project = {
            _id : 0,
            status : "$_id.status",
            statusMessage : "$_id.statusMessage",
            totalAmount : "$totalAmount",
            totalVolume : "$totalVolume"
        }

    
        if(filter.bank)match.bankCode = filter.bank; 

        match = Util.setRange(match,filter);

        console.log(match);

         let transactions = await BankSummary.aggregate([
            { $match: match },
            { $group: group },
            { $sort: { totalVolume: -1 } },
            {$project : project}
        ]).allowDiskUse(true).read("secondary");

        //console.log(transactions)

        let approved = transactions.find(c=>c.status == "00");
        let approvedAmount = approved.totalAmount;
        let approvedVolume = approved.totalVolume;

        let failed = transactions.filter(c=>c.status != "00");
        let failedAmount = Util.sumObjectProp(failed,"totalAmount");
        let failedVolume = Util.sumObjectProp(failed,"totalVolume");

       //check if approved returned 0
        let percentageAmount = Util.percentageCalc(failedAmount, approvedAmount);
        let percentageVolume = Util.percentageCalc(failedVolume, approvedVolume);

        return {
            bank : filter.bank || "All",
            approved : approved || {
                statusMessage : "approved",
                totalAmount : 0,
                totalVolume : 0
            },
            declined : {
                statusMessage : "declined",
                totalAmount : failedAmount,
                totalVolume : failedVolume
            },
            percentageAmount: percentageAmount,
            percentageVolume: percentageVolume
        };
    }

    /**
     * get total bank involved in a spool.
     * @param {*} filter 
     */
    public async getDeclinedOrApprovedSummaryTotalBankCount(filter: any){
        let match = {};

        let group = {
            _id :"$bankCode",
            
        };
        
        match = Util.setRange(match,filter);

        let banks = await BankSummary.aggregate([
            { $match: match },
            { $group: group },
            {$count : 'count'}
        ]).allowDiskUse(true).read("secondary");

        let data = {count : 0};
        if(banks && banks.length)data = banks[0];

        return data;
    }

    /**
     * get bank based transaction summary; approved and declined with status code. 
     * @param {*} filter filter from query
     */
    public async getDeclinedOrApprovedStatusSummary(filter: any){

        let match: any = {};

        let group = {
            _id : {status :"$statusCode",statusMessage : "$messageReason"},
            totalAmount : { $sum : "$totalAmount"},
            totalVolume : {$sum : "$transactionCount"},
            
        };

        let project = {
            _id : 0,
            status : "$_id.status",
            statusMessage : "$_id.statusMessage",
            totalAmount : "$totalAmount",
            totalVolume : "$totalVolume"
        }

        if(filter.bank)match.bankCode = filter.bank; 

        match = Util.setRange(match,filter);

        console.log(match);

        let transactions = await BankSummary.aggregate([
            { $match: match },
            { $group: group },
            { $sort: { totalVolume: -1 } },
            {$project : project}
        ]).allowDiskUse(true).read("secondary");

        return {
            bank : filter.bank || "All",
            approved : transactions.find(c=>c.status == "00"),
            declined : transactions.filter(c=>c.status != "00") || []
        };
    }

    /**
     * get 
     * @param {*} filter filter from query
     */
    public async banksBehaviouralPatternWithStatus(filter: any){

        let match: any = {};

        if(filter.bank){
            // todo
        }


        match = Util.setRange(match,filter);

        let banks = await BankSummary.aggregate([
            {$match : match},
            {$group : {_id : {bankCode : "$bankCode", bankName : "$bankName"}}},
            {$project : {bankCode : "$_id.bankCode",bankName : "$_id.bankName"}}
        ]).allowDiskUse(true).read("secondary")

        console.log(banks);

        let group = {
            _id : {status : "$statusCode", statusMessage : "$messageReason"},
            totalAmount : { $sum : "$totalAmount"},
            totalVolume : {$sum : "$transactionCount"}
        };

        let project = {
            _id : 0,
            status : "$_id.status",
            statusMessage : "$_id.statusMessage",
            totalAmount : "$totalAmount",
            totalVolume : "$totalVolume"
        }

        let facet = {};
        banks.forEach(b=>{
            facet[b.bankCode] = [
                {$match : {bankCode : b.bankCode, createdAt : match.createdAt}},
                {$group : group},
                {$project : project}
            ]
        });
    
        console.log(JSON.stringify(facet));

        return await BankSummary.aggregate([
            {$facet : facet}
        ]).allowDiskUse(true).read("secondary");
    }

    public async bankTransactionWithStatusPercentage(filter: any){
        let match: any = {};

        let group = {
            _id : {status :"$statusCode",statusMessage : "$messageReason"},
            totalAmount : { $sum : "$totalAmount"},
            totalVolume : {$sum : "$transactionCount"},
            
        };

        let project = {
            _id : 0,
            status : "$_id.status",
            statusMessage : "$_id.statusMessage",
            totalAmount : "$totalAmount",
            totalVolume : "$totalVolume"
        }

        if(filter.bank)match.bankCode = filter.bank; 

        match = Util.setRange(match,filter);

        console.log(match);

        let transactions = await BankSummary.aggregate([
            { $match: match },
            { $group: group },
            { $sort: { totalVolume: -1 } },
            {$project : project}
        ]).allowDiskUse(true).read("secondary");

        let totalVolume = transactions.reduce((a, b) => a + (b["totalVolume"] || 0), 0);

        console.log(`total : ${totalVolume}`)

        transactions.forEach(t=>{
            t.percent = (t.totalVolume*100)/totalVolume;
        })

        return {
            bank : filter.bank || "All",
            statuses : transactions
        };
    }

    public async bankTransactionWithCardSchemePercentage(filter: any){
        let match: any = {};

        let group = {
            _id : {card :"$cardScheme"},
            totalAmount : { $sum : "$totalAmount"},
            totalVolume : {$sum : "$transactionCount"},
            
        };

        let project = {
            _id : 0,
            card : "$_id.card",
            totalAmount : "$totalAmount",
            totalVolume : "$totalVolume"
        }

        if(filter.bank)match.bankCode = filter.bank; 

        match = Util.setRange(match,filter);

        console.log(match);

        let transactions = await BankSummary.aggregate([
            { $match: match },
            { $group: group },
            { $sort: { totalVolume: -1 } },
            {$project : project}
        ]).allowDiskUse(true).read("secondary");

        let totalVolume = transactions.reduce((a, b) => a + (b["totalVolume"] || 0), 0);

        console.log(`total : ${totalVolume}`)

        transactions.forEach(t=>{
            t.percent = (t.totalVolume*100)/totalVolume;
        })

        return {
            bank : filter.bank || "All",
            cards : transactions
        };
    }

    public async bankTransactionWithCardSchemePercentageWithFailandApproved(filter: any){
        
        let match: any = {};

        if(filter.bank)match.bankCode = filter.bank; 

        match = Util.setRange(match,filter);

        console.log(match);

        let cards = await BankSummary.aggregate([
            {$match : match },
            {$group : {_id : "$cardScheme"}},
            {$project: {_id : 0, scheme : "$_id"}}
        ]).allowDiskUse(true).read("secondary");

        if(!cards.length) return [];

        let facet = {};

        let group = {
            _id : {status : "$statusCode", statusMessage : "$messageReason"},
            totalAmount : { $sum : "$totalAmount"},
            totalVolume : {$sum : "$transactionCount"},
            
        };

        let project = {
            _id : 0,
            status : "$_id.status",
            statusMessage : "$_id.statusMessage",
            totalAmount : "$totalAmount",
            totalVolume : "$totalVolume"
        }

        cards.forEach(e=>{
            facet[e.scheme] = [
                {$match : {...match,cardScheme : e.scheme}},
                {$group : group},
                {$project : project}
            ]
        });

        let transactions = await BankSummary.aggregate([
            {$facet : facet}
        ]).allowDiskUse(true).read("secondary");

        if(!transactions.length) return [];

        let response = [];

        cards.forEach(e=>{
            let txns = transactions[0][e.scheme];
            let approved = txns.find(c=>c.status == "00");
            console.log(approved);
            let failed = txns.filter(c=>c.status != "00");
            let failedSum  = Util.sumObjectProp(failed,"totalVolume");
            let total = Util.sumObjectProp(txns,"totalVolume");
            response.push({
                card : e.scheme,
                totalVolume : total,
                approvedPercent : approved ? (approved.totalVolume * 100)/total : 0,
                declinedPercent : (failedSum * 100)/total
            });
        })

        return response;
    }
    
    public async getLeastBanksSummary(filter: any){
        let match = {};

        let group = {
            _id : {bank :"$bankCode", bankName : "$bankName"},
            totalAmount : { $sum : "$totalAmount"},
            totalVolume : {$sum : "$transactionCount"},
            
        };

        let project = {
            _id : 0,
            bank : "$_id.bank",
            bankName : "$_id.bankName",
            totalAmount : "$totalAmount",
            totalVolume : "$totalVolume"
        }


        match = Util.setRange(match,filter);
        filter.top = Number(filter.top) || 10;

        console.log(match);

        let banks = await BankSummary.aggregate([
            { $match: match },
            { $group: group },
            { $sort: { totalVolume: 1 } },
            {$limit : filter.top},
            {$project : project}
        ]).allowDiskUse(true).read("secondary");

        let totalVolume = await BankSummary.aggregate([
            {$match : match},
            {$group : {_id :null, sum : {$sum : "$transactionCount"}}}
        ]).allowDiskUse(true).read("secondary");
        
        console.log(totalVolume);

        banks.forEach(e=>{
            e.percent = (e.totalVolume * 100) / totalVolume[0].sum;
        })

        return banks;
    }

    public async generateReportByWeekOrMonth(filter: any) {

        

        // 01-2020 - 02-2020
        if(filter.weekrange_start && filter.range == dateGroup.weekly) {

            let start = Number(filter.weekrange_start.split('-')[0]) || 1;
            let end = filter.weekrange_end ? Number(filter.weekrange_end.split('-')[0]) : start;

            let resultArr = [];

            
            
            for(let i = start; i <= end; i++) {
                let result = {};
                let key = `week ${i}-${filter.weekrange_start.split('-')[1]}`
                filter.weekofyear = i < 10 ? `0${i.toString()}` : i.toString();
                filter.weekofyear = `${filter.weekofyear}-${filter.weekrange_start.split('-')[1]}`;
                result[key] =  await this.getTopBanksSummary(filter);

                resultArr.push(result);

            }


            return resultArr;

        } else if(filter.monthrange_start && filter.range == dateGroup.monthly) {


            let start = Number(filter.monthrange_start.split('-')[0]) || 1;
            let end = filter.monthrange_end ? Number(filter.monthrange_end.split('-')[0]) : start;


            let resultArr = [];

            
            for(let i = start; i <= end; i++) {
                let result = {};

                let key = `month ${i}-${filter.monthrange_start.split('-')[1]}`
                filter.monthofyear = i < 10 ? `0${i.toString()}` : i.toString();
                filter.monthofyear = `${filter.monthofyear}-${filter.monthrange_start.split('-')[1]}`
                result[key] =  await this.getTopBanksSummary(filter);

                resultArr.push(result);

            }


            return resultArr;

        } else {

            return await this.getTopBanksSummary(filter);

        }

    }

    public async getTopBanksSummary(filter: any){
        let match = {};

        let group = {
            _id : {bank :"$bankCode", bankName : "$bankName"},
            totalAmount : { $sum : "$totalAmount"},
            totalVolume : {$sum : "$transactionCount"},
            
        };

        let project = {
            _id : 0,
            bank : "$_id.bank",
            bankName : "$_id.bankName",
            totalAmount : "$totalAmount",
            totalVolume : "$totalVolume"
        }


        match = Util.setRange(match,filter);
        filter.top = Number(filter.top) || 10;

        console.log(match);

        let banks = await BankSummary.aggregate([
            { $match: match },
            { $group: group },
            { $sort: { totalVolume: -1 } },
            {$limit : filter.top},
            {$project : project}
        ]).allowDiskUse(true).read("secondary");

        let totalVolume = await BankSummary.aggregate([
            {$match : match},
            {$group : {_id :null, sum : {$sum : "$transactionCount"}}}
        ]).allowDiskUse(true).read("secondary");
        
        console.log(totalVolume);

        banks.forEach(e=>{
            e.percent = (e.totalVolume * 100) / totalVolume[0].sum;
        })

        return banks;
    }

    public async getAllBanks(){
        return banksList;
    }

    public async getTopError(filter: any){

        let match: any = {statusCode : {$ne : "00"}};

        let group = {
            _id : {status :"$statusCode",statusMessage : "$messageReason"},
            totalAmount : { $sum : "$totalAmount"},
            totalVolume : {$sum : "$transactionCount"} 
        };

        let project = {
            _id : 0,
            status : "$_id.status",
            statusMessage : "$_id.statusMessage",
            totalAmount : "$totalAmount",
            totalVolume : "$totalVolume"
        }

    
        if(filter.bank)match.bankCode = filter.bank; 

        match = Util.setRange(match,filter);
        filter.top = Number(filter.top) || 10;

        console.log(match);

         let transactions = await BankSummary.aggregate([
            { $match: match },
            { $group: group },
            { $sort: { totalVolume: -1 } },
            { $limit : filter.top },
            {$project : project}
        ]).allowDiskUse(true).read("secondary");

        return {
            bank : filter.bank || "All",
            errors : transactions
        };
    }

}

export default new BankSummaryServices();