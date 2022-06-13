
// import moment from 'moment';
// import Utils from '../helpers/utils';
// import Journals from '../db/model/journal.model';
// import VasJournals from '../db/model/vasjournals.model';
// // import 




// class SummaryServices {

//     getTransactionSummary(filter: any) {

//         try {

//             // this should get a filter by date and range(day, week, month)
//             // walletId, merchantCode

//             let match: any = await this.buildQuery(filter);

//             filter = Utils.setPaging(filter);


//             query = [
//                 {$match : match},
//                 {$sort : {transactionTime : -1}},
//                 {$skip : filter.skip},
//                 {$limit : filter.pageSize}
//             ]

//             // const transactions = await Journals.

//             // Failed 
//             // Success
//             // Count 

//         } catch (error) {
            
//         }

//     }

//     getTransactionsSummaryVasWallet() {

//         try {

//             // this should get a filter by date and range(day, week, month)
//             // walletId, merchantCode

//         } catch (error) {


            
//         }

//     }

//     getWalletBalance() {

//         // Get Wallet balance from Paysure Core for walletId or MerchantCode

//     }


//     getTerminalsSummaryByWalletID() {

//         try {

//             // Get Terminals by walletId
//             // Get Active and Inactive Summmary for the terminals 
            
//         } catch (error) {
            
//         }

//     }

// }

// export default new SummaryServices();