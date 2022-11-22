
/* eslint-disable func-names */
/* eslint-disable no-restricted-globals */
// eslint-disable-next-line no-unused-vars
import express from 'express';
// import { Worker } from 'webworker-threads';
import TransactionService from '../services/transaction.services';
import ApiResponse from "../helpers/apiResponse";
import { apiStatusCodes  } from "../helpers/constants";
import TerminalService from '../services/terminal.services';
import { curDate, validateMongoID, getPrevStartEndDate } from '../helpers/util';
// import MerchantService from '../database/services/MerchantService';
// import Logger from '../helpers/Logger';
import { ObjectID } from 'mongodb';
import Journals from "../db/model/journal.model";
import { transMod } from "../config";

class TransactionController {

  /**
  * This handles getting transaction history.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async history(req, res) {
    const {
      enddate, startdate, page, limit, merchant, terminal, status, search, source,
    } = req.query;

    const { user } = req;
    
    const transServ = new TransactionService();
    transServ.setPage(page)
      .setLimit(limit)
      .setMerchant(null)
      .setTerminal(terminal)
      .setStatus(status)
      .setDate(startdate, enddate)
      .setSearch(search)
      .setSource(source);

    try {
      const transactions = await transServ.history();
      ApiResponse.send(res, apiStatusCodes.success, 'Retrived Successfully', {
        data: transactions,
      });
    } catch (error) { ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  /**
  * This handles getting transaction history.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async cardTransactionHistory(req, res) {
    const {
      enddate, startdate, page, limit, terminal, status, search, source, rrn
    } = req.query;
    const { walletId } = req.params;
    const transServ = new TransactionService();
    transServ.setPage(page)
      .setLimit(limit)
      .setTerminal(terminal)
      .setWallet(walletId)
      .setStatus(status)
      .setRRNs(rrn)
      .setDate(startdate || curDate(), enddate || curDate())
      .setSearch(search)
      .setSource(source);

    try {
      let transactions = await transServ.history();
      // transactions = transactions.filter((element) => element.wallet == walletId);
      ApiResponse.send(res, apiStatusCodes.success, 'Retrived Successfully', {
        data: transactions,
      });
    } catch (error) { ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  async cardTransactionHistoryV2(req, res) {
    const {
      enddate, startdate, page, limit, terminal, status, search, source, rrn
    } = req.query;
    const { walletId } = req.params;
    const transServ = new TransactionService();
    transServ.setPage(page)
      .setLimit(limit)
      .setTerminal(terminal)
      .setStatus(status)
      .setRRNs(rrn)
      .setDate(startdate || curDate(), enddate || curDate())
      .setSearch(search)
      .setSource(source);

    try {
      let transactions = await transServ.vasHistory();
      ApiResponse.send(res, apiStatusCodes.success, 'Retrived Successfully',{
        data: transactions,
      });
    } catch (error) { ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  /**
  * This handles getting transaction history.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async singleCardTransactionHistory(req, res) {
    const { rrn, walletid } = req.params;
    const { transactionDate } = req.query;
    //const authKey = req.headers['authkey'];
    //const value = authKey.split("|");

    const wallet_id = req.walletId;
    console.log('walletId:', walletid)
    console.log('wallet_id:', wallet_id)
    if (!walletid && !wallet_id) {
      return ApiResponse.send(res, apiStatusCodes.badRequest, 'Validation error', {
        message: 'Please provide all required details'
      });
    }

    //const { merchant_id: loggedInMerch = merchant } = user;

    const transServ = new TransactionService();
    transServ
      //.setPage(page)
      //.setLimit(limit)
      //.setTerminal(terminal)
      .setWallet(walletid || wallet_id)
      //.setStatus(status)
      .setDate(transactionDate || curDate())
      .setRRNs(rrn)
    //.setSource(source);

    try {
      const transaction = await transServ.singleCardTransactionHistory();

      if (!transaction) {
        ApiResponse.send(res, apiStatusCodes.created, '', {
          data: {message: `No record found for this rrn ${rrn}`},
        });
      }
      else {
        transaction.walletId = walletid || wallet_id;
        ApiResponse.send(res, apiStatusCodes.success, 'Retrived Successfully', {
          data: transaction,
        });
      }

    } catch (error) { ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  /**
  * This handles getting transactions for every hour for the transaction chart.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async time(req, res) {
    const { date, type } = req.query;

    const { user } = req;
    const range = ['daily', 'weekly', 'monthly', 'yearly'].includes(type) ? type.substring(0, 1) : 'd';
    // const { merchant_id: loggedInMerch = null } = user;

    try {
      const transServ = new TransactionService();
      transServ.setDate(date || curDate()).setMerchant(null);

      const data = await transServ.time(range, date || curDate());
      ApiResponse.send(res, apiStatusCodes.success, 'Retrived Successfully',{
        data,
      });
    } catch (error) { ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  /**
  * This handles getting transactions statistics.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async stat(req, res) {
    const { startdate, date, enddate } = req.query;

    const { user } = req;
    // const { merchant_id: loggedInMerch = null } = user;

    try {
      const transServ = new TransactionService();
      transServ.setDate(startdate || date || curDate(), enddate).setMerchant(null);

      const stats = await transServ.stat();
      ApiResponse.send(res, apiStatusCodes.success, '', {
        data: stats,
      });
    } catch (error) { ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }


  /**
  * This handles getting transactions statistics.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async statSummary(req, res) {
    const { startdate, date, enddate } = req.query;

    const { user } = req;
    // const { merchant_id: loggedInMerch = null } = user;

    try {
      const transServ = new TransactionService();
      transServ.setDate(startdate || date || curDate(), enddate).setMerchant(null);

      const stats = await transServ.statSummary();
      ApiResponse.send(res, apiStatusCodes.success, '', {
        data: stats,
      });
    } catch (error) { ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }


  /**
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async failureReason(req, res) {
    const {
      enddate, startdate, merchant, terminal, search, source,
    } = req.query;

    const { user } = req;
    // const { merchant_id: loggedInMerch = merchant } = user;

    const transServ = new TransactionService();
    transServ.setStatus('failed')
      .setMerchant(null)
      .setTerminal(terminal)
      .setDate(startdate || curDate(), enddate)
      .setSearch(search)
      .setSource(source);

    try {
      const reasons = await transServ.failureReason();

      ApiResponse.send(res, apiStatusCodes.success,'', {
        data: reasons,
      });
    } catch (error) { ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  /**
  * This handles getting transactions summary for merchants.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async performance(req, res) {
    const {
      startdate, enddate, search, page, limit, sort, dir,
    } = req.query;

    const sortParams = {
      value: 'trans_value',
      volume: 'trans_volume',
      activeterm: 'active_terminals',
    };

    const transServ = new TransactionService();
    transServ.setPage(page).setLimit(limit)
      .setDate(startdate || curDate(), enddate)
      .setSearch(search)
      .setSort(sortParams[sort] || 'trans_value', dir);


    const prevDate = getPrevStartEndDate(startdate, enddate);
    const prevStartDate = prevDate.start;
    const prevEndDate = prevDate.end;
    try {
      const transData = await transServ.performance() as any;
      const { transactions, summary } = transData;

      const merchantIds = transactions.map(a => a.merchant_id);

      transServ.setMerchant(merchantIds).setDate(prevStartDate, prevEndDate);
      const prevTransData = await transServ.performance() as any;
      const { transactions: prevTransactions } = prevTransData;


      const terminalStats = await TerminalService.getMerchantsTerminalStats(merchantIds);

      const data = transactions.map((item) => {
        const prevTran = prevTransactions.find(rec => rec.merchant_id === item.merchant_id) || {};
        const termStat = terminalStats.find(rec => rec.merchant_id === item.merchant_id) || {};
        item.value_change = (item.trans_value || 0) - (prevTran.trans_value || 0);
        item.volume_change = (item.trans_volume || 0) - (prevTran.trans_volume || 0);
        const inactive_terminals = termStat.terminals_count - item.active_terminals;
        item.inactive_terminals = inactive_terminals > 0 ? inactive_terminals : 0;
        return item;
      });

      ApiResponse.send(res, apiStatusCodes.success, '', {
        data, summary,
      });
    } catch (error) { ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  /**
  * This handles getting transactions summary for merchants.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async termPerformance(req, res) {
    // const {
    //   startdate, enddate, search, page, limit,
    // } = req.query;

    // const transServ = new TransactionService();
    // transServ.setPage(page).setLimit(limit);
    // if (startdate) transServ.setDate(startdate, enddate);
    // if (search) transServ.setSearch(search);

    // const prevDate = getPrevStartEndDate(startdate, enddate);
    // const prevStartDate = prevDate.start;
    // const prevEndDate = prevDate.end;

    // try {
    //   const transData:any = await transServ.performance();
    //   // const { transactions, summary } = transData;

    //   const terminalIds = transData.transactions.map(a => a.terminal_id);

    //   transServ.setTerminal(terminalIds).setDate(prevStartDate, prevEndDate);
    //   const prevTransData:any = await transServ.performance();
    //   const { transactions: prevTransactions } = prevTransData;

    //   const data = transactions.map((item) => {
    //     const prevTran = prevTransactions.find(rec => rec.terminal_id === item.terminal_id) || {};
    //     item.value_change = (item.trans_value || 0) - (prevTran.trans_value || 0);
    //     item.volume_change = (item.trans_volume || 0) - (prevTran.trans_volume || 0);
    //     return item;
    //   });

    //   ApiResponse.send(res, apiStatusCodes.success, '', {
    //     data, transData.summary,
    //   });
    // } catch (error) { ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  /**
  * This handles getting transactions summary for merchants.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async getReceipt(req, res) {
    const { id } = req.params;
    if (!validateMongoID(id)) {
      return ApiResponse.send(res, apiStatusCodes.notFound,'', {
        error: 'Transaction not found.',
      });
    }

    try {

      const $project = {
        terminal_id: `$${transMod.getField('terminal_id')}`,
        amount: `$${transMod.getField('amount')}`,
        transaction_date: `$${transMod.getField('transaction_date')}`,
        merchant_id: `$${transMod.getField('merchant_id')}`,
        merchant_name: `$${transMod.getField('merchant_name')}`,
        rrn: `$${transMod.getField('rrn')}`,
        prrn: `$${transMod.getField('prrn')}`,
        pan: `$${transMod.getField('pan')}`,
        authcode: `$${transMod.getField('authcode')}`,
        stan: `$${transMod.getField('stan')}`,
        response_msg: `$${transMod.getField('response_msg')}`,
        response_code: `$${transMod.getField('response_code')}`,
        country_code: `$${transMod.getField('country_code')}`,
        country_a2code: `$${transMod.getField('country_a2code')}`,
        currency_code: `$${transMod.getField('currency_code')}`,
        currency_symbol: `$${transMod.getField('currency_symbol')}`,
        bin: `$${transMod.getField('bin')}`,
        settled: `$settled`,
        panNo: { $substr: [`$${transMod.getField("pan")}`, 0, 6] },
        services: `$vasData.body.service`,
        processor: `$handlerUsed`,
        vTid: `$vasData.card.vTid`,
        wallet: `$vasData.wallet`,
        customerRef: "$customerRef",
      };

      const transactions:any = await Journals.aggregate([
        { $match: { MTI: '0200', _id: new ObjectID(id) } },
        { $project },
      ]);

      if (!transactions) {
        return ApiResponse.send(res, apiStatusCodes.notFound, 'Record not found', {
          error: 'Transaction not found.',
        });
      }

      const merchantId = transactions[0].merchant_id;
      // const merch = await MerchantService.getMerchant(merchantId) || {};
      // const data = await VasReportService.getTransReceiptData(trans.rrn, trans.terminal_id);

      const trans = transactions[0];
      return ApiResponse.send(res, apiStatusCodes.success, 'Retrived Successfully',{
        data: {
          ...trans,
          transaction_data: {
            // merchantName: merch.merchant_name || trans.merchant_name,
            // merchant_address: merch.merchant_address,
            amount: transactions.amount,
            date: trans.trans_date,
            mPan: trans.pan,
            mid: trans.merchant_id,
            tid: trans.terminal_id,
            rrn: trans.rrn,
            stan: trans.stan,
            error: trans.status_code !== '00',
            message: trans.status,
            // ...data,
          },
        },
      });
    } catch (error) { return ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }


  async uploadFile(req, res) {
    const filePath = req.body.xlsx_file;
    const processors = `${req.body.processors}`.split(',').map(a => a.trim());

    // const validate = await validateSwitchFileUpload('transaction', processors, filePath);
    // if (validate.error) return ApiResponse.validationError(res, validate.fields);

    // // Processing is done in a worker thread
    // const worker = new Worker(function () {
    //   this.onmessage = function (event) {
    //     this.postMessage(event.data);
    //     // eslint-disable-next-line no-undef
    //     self.close();
    //   };
    // });
    // worker.onmessage = function () {
    //   XLSXReader.transaction(filePath, processors, req.user);
    // };
    // worker.postMessage();

    // return ApiResponse.send(res, apiStatusCodes.success, {
    //   data: {
    //     message: 'Upload processing.',
    //   },
    // });
  }

  /**
  * This handles getting transactions summary for merchants.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async addTrans(req, res) {
    const {
      terminal_id, rrn, stan, pan, auth_code, response_code, response_msg, amount, merchant_id, transaction_date, mti,
    } = req.body;

    try {
      const trans = new Journals({
        terminal_id, rrn, stan, pan, auth_code, response_code, response_msg, amount, merchant_id, transaction_date, mti, ptsp: req.ptsp,
      });
      await trans.save();

      ApiResponse.send(res, apiStatusCodes.success,'Retrived Successfully', {
        message: 'Successful',
      });
    } catch (error) { ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  /**
  * This handles getting transactions summary for banks and card schemes.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */

   async banksAndCardSchemesSummary(req, res) {
    const {
      startdate, date, enddate
    } = req.query;

    try {
      const transServ = new TransactionService();
      transServ.setDate(startdate || date || curDate(), enddate);

      const stats = await transServ.getCardSchemeSummary();
      ApiResponse.send(res, apiStatusCodes.success, 'Retrived Successfully', {
        data: stats,
      });
    } catch (error) { ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }

  /**
  * This handles getting transaction download.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
   async downloadJournal(req, res) {
    const {
      enddate, startdate, page, limit, merchant, terminal, status, search, source,
    } = req.query;

    const { user } = req;
    // const { merchant_id: loggedInMerch = merchant } = user;

    const transServ = new TransactionService();
    transServ.setPage(page)

      // .setLimit(limit)
      .setMerchant(null)
      .setTerminal(terminal)
      .setStatus(status)
      .setDate(startdate, enddate)
      .setSearch(search)
      .setSource(source);

    try {

      //get total count on db
      let data = await transServ.getQueryTotalForDownload() as any;
      console.log("counting ", data)
      if (!data) {
        console.log("counting ", data)
        ApiResponse.send(res, apiStatusCodes.success,'Retrived Successfully', {
          data: "No record Found",
        });
      }


      // const transactions = await transServ.download();
      const file = await transServ.generateReportTlm(data.total, data.filename);
      ApiResponse.send(res, apiStatusCodes.success,'Retrived Successfully', {
        data: `${process.env.API_URL}/files/${file}`,
      });
    } catch (error) { ApiResponse.error(res,apiStatusCodes.serverError,error, null); }
  }
}

export default new TransactionController();

