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
import { AuditEventResources } from '../db/model/audit.model';
import { AuditActionResources } from '../db/model/audit.model';
import AuditEvent from '../events/audits.events';

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
        itemCount ,
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

  async activateDeactvateMerchant(req, res) {

    try {

       const { merchantCode } = req.params;

       const merchant:any = await Merchant.findOne({ merchantCode });
       if (!merchant) {
         return ApiResponse.send(res, apiStatusCodes.notFound, '',{ error: 'Merchant account not found.' });
       }
       const activateResponse =  await merchant.update({
        isApproved: !merchant.isApproved
      });
       console.log('activateResponse', activateResponse)
       const messageAction = merchant.isApproved === true ? 'deactivated' : 'activated'

       if (!activateResponse) {
          return ApiResponse.error(res, apiStatusCodes.badRequest, null, 'Could not activate/deactivate Merchant, invalid Merchant');
       }

       console.log(activateResponse.isApproved);
       
       const ts_hms = new Date().toISOString();
       const aduitPayload = {
          auditActivity: AuditEventResources.MerchantView,
          auditType: AuditActionResources.MerchantActivate,
          description: `${req.user.emailAddress} ${messageAction} a new merchant with id ${merchantCode} @ ${ts_hms}`,
          user: {
             name: req.user.name || "",
             email: req.user.emailAddress,
             role: req.user.roles[0] || "",
          },
          ipAddress: "IP.address()"
       }
       const event = new AuditEvent();
       event.emit('complete', aduitPayload)
       return ApiResponse.success(res, apiStatusCodes.success,
          null,
          `Merchant was successfully ${messageAction}`);

    } catch (error) {

       return ApiResponse.error(res, apiStatusCodes.serverError, null, error);

    }

 }

  async update(req, res) {
    const {
      name, email, phoneNumber, account, bank, band
    } = req.body;

    try {
      const merchant = await Merchant.findOne({ merchantCode: req.params.mid });
      if (!merchant) {
        return ApiResponse.send(res, apiStatusCodes.notFound, '',{ error: 'Merchant account not found.' });
      }
      await merchant.update({
        name, email, phoneNumber, account, bank, band
      });
      const ts_hms = new Date().toISOString();
      const aduitPayload = {
         auditActivity: AuditEventResources.MerchantView,
         auditType: AuditActionResources.MerchantUpdate,
         description: `${req.user.emailAddress} updated a new merchant with id ${req.body.merchantCode} @ ${ts_hms}`,
         user: {
            name: req.user.name || "",
            email: req.user.emailAddress,
            role: req.user.roles[0] || "",
         },
         ipAddress: "IP.address()"
      }
      const event = new AuditEvent();
      event.emit('complete', aduitPayload)
      return ApiResponse.send(res, apiStatusCodes.success, '',{
        message: 'Merchants updated successfully',
      });
    } catch (error) { return  ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  /**
  * This handles getting all terminals.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async createMerchant(req, res) {
   
    try {
      const merchant = await Merchant.findOne({ merchantCode: req.body.merchantCode });
      if (merchant) {
        return ApiResponse.send(res, apiStatusCodes.notFound, '',{ error: 'Merchant account Already Created.' });
      }
      await MerchantService.create(req.body);
      const ts_hms = new Date().toISOString();
      const aduitPayload = {
         auditActivity: AuditEventResources.MerchantView,
         auditType: AuditActionResources.MerchantCreate,
         description: `${req.user.emailAddress} created a new merchant with id ${req.body.merchantCode} @ ${ts_hms}`,
         user: {
            name: req.user.name || "",
            email: req.user.emailAddress,
            role: req.user.roles[0] || "",
         },
         ipAddress: "IP.address()"
      }
      const event = new AuditEvent();
      event.emit('complete', aduitPayload)
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

      ApiResponse.send(res, apiStatusCodes.success, '', merchants);
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
    // const { merchant_id: loggedInMerch = null } = user;

    try {
      const merchant = await MerchantService.getMerchant(mid);

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
      
      const { transactions, summary } = transData;

      const tids:any = transData.transactions.map(item => item.terminal_id);

      tranServ.setDate(prevStartDate, prevEndDate).setTerminal(tids);
      const prevTransData:any = await tranServ.performance('terminal');
      const { transactions: prevTransactions } = prevTransData;

      const data:any = transData.transactions.map((item) => {
        const prevTran = prevTransData.prevTransactions.find(rec => rec.terminal_id === item.terminal_id) || {};
        item.value_change = (item.trans_value || 0) - (prevTran.trans_value || 0);
        item.volume_change = (item.trans_volume || 0) - (prevTran.trans_volume || 0);
        return item;
      });

      ApiResponse.send(res, apiStatusCodes.success, '',{
        data: data.rows || data,
        summary,
      });
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
