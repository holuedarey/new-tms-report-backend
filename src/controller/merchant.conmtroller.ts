// eslint-disable-next-line no-unused-vars
import express from 'express';
import moment from 'moment';
import ApiResponse from "../helpers/apiResponse";
import { apiStatusCodes } from "../helpers/constants";
// import Dispute from '../database/mongodb/models/Dispute';
import MerchantService from '../services/merchant.service';
import Merchant from '../db/model/merchant.model';
// import { getUserPosVal } from '../database/mongodb/models/User';
import {validateDate, curDate, getRegExp, validateMongoID, checkNumber,getPrevStartEndDate} from '../helpers/util';
import TransactionService from '../services/transaction.services';

/**
* Merchant Controller
*/
class MerchantController {
  /**
  * This handles getting merchants count.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async getCount(req, res) {
    try {
      const itemCount = await MerchantService.getAllCount(req.query.search);

      ApiResponse.send(res, apiStatusCodes.success, '', {
        data: { itemCount },
      });
    } catch (error) {  ApiResponse.error(res,apiStatusCodes.serverError,error, null);  }
  }

  async getOnBoard(req, res) {
    const { user = {} } = req;
    let { page, limit } = req.query;

    limit = Number.isNaN(parseInt(limit, 10)) ? 30 : parseInt(limit, 10);
    page = Number.isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);

    const offset = (page - 1) * limit;
    let apprLevel = 1;
    apprLevel = apprLevel < 0 ? 0 : apprLevel;

    try {
      const filter = {
        $and: [
          { approved: false },
          { approval_level: { $gte: apprLevel } },
        ],
      };
      const merchants = await Merchant.find(filter).skip(offset).limit(limit);

      ApiResponse.send(res, apiStatusCodes.success, '', {
        data: merchants,
      });
    } catch (error) {  ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  async setDataOnBoard(req, res) {
    const { user = {} } = req;
    const { mid, merchant_id, mcc } = req.body;

    let apprLevel = 0;
    apprLevel = apprLevel < 0 ? 0 : apprLevel;

    if (apprLevel < 5) {
      return ApiResponse.send(res, apiStatusCodes.forbidden, '', {
        message: 'You are not permitted to do this.',
      });
    }

    if (!mcc && !merchant_id) {
      return ApiResponse.validationError(res, { merchant_id: 'Merchant ID or MCC is required.' });
    }

    const filter = {
      _id: mid,
      $and: [
        { approved: false },
        { approval_level: { $gte: apprLevel - 1 } },
      ],
    };

    const merchant:any = await Merchant.findOne(filter);
    if (!merchant) {
      return ApiResponse.send(res, apiStatusCodes.notFound, '', {
        error: 'Merchant could not be found.',
      });
    }
    if (merchant_id) merchant.merchant_id = merchant_id;
    if (mcc) merchant.mcc = mcc;
    await merchant.save();

    return ApiResponse.send(res, apiStatusCodes.success,'', {
      message: 'Data set successfully.',
    });
  }

  // async rejectOnBoard(req, res) {
  //   const { user = {} } = req;
  //   const { mid } = req.body;

  //   if (!validateMongoID(mid)) {
  //     return ApiResponse.send(res, apiStatusCodes.notFound, '',{
  //       error: 'Merchant could not be found.',
  //     });
  //   }

  //   let apprLevel = 0;
  //   apprLevel = apprLevel < 0 ? 0 : apprLevel;

  //   const filter = {
  //     _id: mid,
  //     $and: [
  //       { approved: false },
  //       { approval_level: { $gte: apprLevel - 1 } },
  //     ],
  //   };

  //   try {
  //     const merchant = await Merchant.findOne(filter);
  //     if (!merchant) {
  //       return ApiResponse.send(res, apiStatusCodes.notFound,'', {
  //         error: 'Merchant could not be found.',
  //       });
  //     }

  //     if (merchant.approval_level >= apprLevel) {
  //       return ApiResponse.send(res, apiStatusCodes.success, '',{
  //         message: 'This Merchant has already been approved.',
  //       });
  //     }

  //     merchant.approval_level = apprLevel - 1;
  //     await merchant.save();

  //     return ApiResponse.send(res, apiStatusCodes.success, '', {
  //       message: 'Merchant successfully rejected.',
  //     });
  //   } catch (error) { return  ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  // }

  // async approveOnBoard(req, res) {
  //   const { user = {} } = req;
  //   const { mid } = req.body;

  //   if (!validateMongoID(mid)) {
  //     return ApiResponse.send(res, apiStatusCodes.notFound,'', {
  //       error: 'Merchant could not be found.',
  //     });
  //   }

  //   let apprLevel = 0;
  //   apprLevel = apprLevel < 0 ? 0 : apprLevel;

  //   const filter = {
  //     _id: mid,
  //     $and: [
  //       { approved: false },
  //       { approval_level: { $gte: apprLevel - 1 } },
  //     ],
  //   };

  //   try {
  //     const merchant:any = await Merchant.findOne(filter);
  //     if (!merchant) {
  //       return ApiResponse.send(res, apiStatusCodes.notFound, '',{
  //         error: 'Merchant could not be found.',
  //       });
  //     }

  //     if (merchant.approval_level >= apprLevel) {
  //       return ApiResponse.send(res, apiStatusCodes.success,'', {
  //         message: 'This Merchant has already been approved.',
  //       });
  //     }

  //     merchant.approval_level = apprLevel;
  //     await merchant.save();

  //     return ApiResponse.send(res, apiStatusCodes.success, '',{
  //       message: 'Merchant successfully approved.',
  //     });
  //   } catch (error) { return  ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  // }

  async onBoard(req, res) {
    const {
      merchant_name, rc_number, merchant_address, merchant_email, merchant_phone, business_industry, merchant_contacts, merchant_description, terminals, terminals_count, merchant_account_name, merchant_account_nr, merchant_account_type, bank_branch: merchant_bank_branch, opening_hours, price_ranges,
    } = req.body;

    const { user = {} } = req;

    const merchant:any = {
      merchant_name, rc_number, merchant_address, merchant_email, business_industry, merchant_contacts, terminals, merchant_description, terminals_count, merchant_account_name, merchant_account_nr, merchant_account_type, merchant_bank_branch, merchant_phone, opening_hours, price_ranges, merchant_contact: merchant_contacts[0].contact_name,
    };

    merchant.bank_branch = user.bank_branch;
    merchant.approved_by = [{
      id: user._id,
      name: `${user.firstname} ${user.lastname}`,
      role: user.roles,
      approval_level: 0,
    }];
    merchant.approved = false;
    merchant.approval_level = 0;

    try {
      const merch = new Merchant(merchant);
      await merch.save();

      ApiResponse.send(res, apiStatusCodes.success, '',{
        data: merch,
        message: 'Merchants added successfully',
      });
    } catch (error) {  ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  async onBoard2(req, res) {
    const {
      mid, profile_compliance, referral_staff, referral_staff_id, ussd_code, business_occupation_code, pan_account_nr, msc_rate, upper_limit, settlement_cycle,
    } = req.body;

    try {
      const merchant = await Merchant.findOne({ _id: mid });
      if (!merchant) {
        return ApiResponse.send(res, apiStatusCodes.notFound, '',{ error: 'Merchant account not found.' });
      }
      await merchant.update({
        profile_compliance, referral_staff, referral_staff_id, ussd_code, business_occupation_code, pan_account_nr, msc_rate, upper_limit, settlement_cycle, approval_level: 1,
      });
      return ApiResponse.send(res, apiStatusCodes.success, '',{
        data: {
          message: 'Merchants added successfully',
        },
      });
    } catch (error) { return  ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  /**
  * This handles getting all terminals.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async upBoard(req, res) {
    const { data } = req.body;
    const merchants = data.map((item) => {
      item.assigned = false;
      return item;
    });

    try {
      await MerchantService.create(merchants);

      ApiResponse.send(res, apiStatusCodes.success,'', {
        message: 'Merchants added successfully.',
      });
    } catch (error) {  ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  /**
  * This handles viewing all merchants.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async viewAll(req, res) {
    let { page, limit, merchants: mids } = req.query;
    const { search } = req.query;

    
    limit = Number.isNaN(parseInt(limit, 10)) ? 30 : parseInt(limit, 10);
    page = Number.isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);
    mids = (mids || '').split(',').map(item => item.trim()).filter(item => item);

    try {
      const merchants = await MerchantService.getMerchants(page, limit, search, mids);

      ApiResponse.send(res, apiStatusCodes.success, '',{
        data: merchants.rows,
      });
    } catch (error) {  ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  /**
  * This handles viewing one merchant by ID.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async viewOne(req, res) {
    const { mid } = req.params;

    const { user = {} } = req;
    const { merchant_id: loggedInMerch = null } = user;

    try {
      const merchant = await MerchantService.getMerchant(loggedInMerch || mid);

      if (!merchant) {
        return ApiResponse.send(res, apiStatusCodes.notFound,'', {
          error: 'Merchant not found.',
        });
      }

      return ApiResponse.send(res, apiStatusCodes.success, '',{
        data: merchant,
      });
    } catch (error) { return  ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  /**
  * This handles viewing transactions summary of a given merchant by merchantID.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async terminalPerformance(req, res) {
    const startDate = req.query.date || req.query.startdate || curDate();
    const endDate = req.query.enddate || startDate;

    const { user } = req;
    const { merchant_id = req.params.mid } = user;

    const {
      sort, dir, page, limit,
    } = req.query;

    const sortParams = {
      value: 'trans_value',
      volume: 'trans_volume',
      activeterm: 'active_terminals',
    };

    const tranServ = new TransactionService();
    tranServ.setPage(page).setLimit(limit).setMerchant(merchant_id)
      .setDate(startDate, endDate)
      .setSort(sortParams[sort] || 'trans_value', dir)
      .setPage(page)
      .setLimit(limit);

    const prevDate:any = getPrevStartEndDate(startDate, endDate);
    const prevStartDate = prevDate.start;
    const prevEndDate = prevDate.end;

    try {
      const transData:any = await tranServ.performance('terminal');
      // const { transactions, summary } = transData;

      // const tids = transDatan.transactions.map(item => item.terminal_id);

      // tranServ.setDate(prevStartDate, prevEndDate).setTerminal(tids);
      // const prevTransData = await tranServ.performance('terminal');
      // // const { transactions: prevTransactions } = prevTransData;

      // const data = transData.transactions.map((item) => {
      //   const prevTran = prevTransDatan.prevTransactions.find(rec => rec.terminal_id === item.terminal_id) || {};
      //   item.value_change = (item.trans_value || 0) - (prevTran.trans_value || 0);
      //   item.volume_change = (item.trans_volume || 0) - (prevTran.trans_volume || 0);
      //   return item;
      // });

      // ApiResponse.send(res, apiStatusCodes.success, '',{
      //   data: data.rows || data,
      //   transData.summary,
      //   merchant_id,
      // });
    } catch (error) {  ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }


  /**
  * This handles merchants responding to a dispute.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async txnSummary(req, res) {
    let { date, page, type } = req.query;

    date = date || curDate();
    if (!validateDate(date, res)) return;
    page = page && checkNumber(page) ? parseInt(page, 10) : 1;

    const { user } = req;
    const { merchant_id } = user;

    try {
      const mDate = moment(date, 'YYYY-MM-DD');
      type = ['weekly', 'monthly'].includes(type) ? type : 'daily';

      let start = mDate.date();
      let end = start;

      if (type !== 'daily') {
        start = 1;
        const isThisMonth = mDate.diff(new Date(), 'month') === 0;
        end = isThisMonth ? moment().date() : mDate.daysInMonth();
        if (type === 'weekly') {
          end -= (page - 1) * 7;
          start = end - 6;
          if (start < 1) start = 1;
          if (end < 1) end = 1;
        }
      }

      const transPromises = [];
      for (let i = start; i <= end; i++) {
        const d = mDate.date(i).toDate();
        const transServ = new TransactionService();
        transServ.setMerchant(merchant_id).setDate(d);
        transPromises.push(transServ.summary(false));
      }
      const transRecs = await Promise.all(transPromises);
      const records = [].concat(...transRecs);

      ApiResponse.send(res, apiStatusCodes.success, '',{
        data: records,
      });
    } catch (error) {  ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }
}

export default new MerchantController();
