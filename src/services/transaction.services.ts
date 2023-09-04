import moment from "moment";
import mongoose from "mongoose";
import Journals from "../db/model/journal.model";
// eslint-disable-next-line import/no-cycle
import TerminalService from "../services/terminal.services";
import { checkNumber, generateFilename, getReportHeaders, removeFile, curDate, getRegExp, binConverter } from "../helpers/util";
import { transMod } from "../config";
import ExcelJS from 'exceljs';
import Utils from "../helpers/utils";
import terminalServices from "../services/terminal.services";

class TransactionService {

  private $limit: number;
  private $skip: number;
  private authService;
  private $match;
  private Transaction;
  private $sort: any;
  constructor() {
    this.Transaction = Journals;

    this.$match = {};
    // if (process.env.BANK_TERM_PREFIXES) {
    //   const terms = process.env.BANK_TERM_PREFIXES.split(",").map((item) =>
    //     getRegExp(item.trim())
    //   );
    //   this.$match[transMod.getField("terminal_id")] = { $in: terms };
    // }
    this.$sort = {};
    this.$limit = 50;
    this.$skip = 0;
  }

  setWallet(wid) {
    if (wid) {
      this.$match['vasData'] = { $ne: null };
      this.$match['vasData.wallet'] = wid.trim();
      // this.$match["customerRef"] = { $regex: wid.trim() };
    }
    return this;
  }

  setIDs(ids) {
    if (ids) {
      if (!Array.isArray(ids)) ids = [ids];
      ids = ids.map((id) => mongoose.Types.ObjectId(id));
      console.log("ids :", ids);

      this.$match._id = { $in: ids };
    }
    return this;
  }

  setID(id) {
    if (id) {
      id = mongoose.Types.ObjectId(id);
      this.$match._id = id;
    }
    return this;
  }

  setDate(start, end?, range = "d") {
    if (start) {
      this.$match[transMod.getField("transaction_date")] = {
        $gte: moment(start, "YYYY-MM-DD")
          .tz(process.env.TZ)
          .startOf('d')
          .toDate(),
        $lte: moment(end || start, "YYYY-MM-DD")
          .tz(process.env.TZ)
          .endOf('d')
          .toDate(),
      };
    }
    return this;
  }

  setLimit(limit) {
    if (checkNumber(limit)) this.$limit = parseInt(limit, 10);
    return this;
  }

  setPage(page) {
    if (page) {
      const pageNo = checkNumber(page) ? parseInt(page, 10) : 1;
      this.$skip = (pageNo - 1) * this.$limit;
    }
    return this;
  }

  setMerchant(mid) {
    if (mid) {
      if (!Array.isArray(mid)) mid = [mid];
      this.$match[transMod.getField("merchant_id")] = { $in: mid };
    }
    return this;
  }

  setTerminal(tid) {
    if (tid) {
      if (!Array.isArray(tid)) tid = [tid];
      this.$match[transMod.getField("terminal_id")] = { $in: tid };
    }
    return this;
  }

  setRRNs(rrns) {
    if (rrns) {
      if (!Array.isArray(rrns)) rrns = [rrns];
      this.$match[transMod.getField("rrn")] = { $in: rrns };
    }
    return this;
  }

  setRRNSett(rrns) {
    if (rrns) {
      if (!Array.isArray(rrns)) rrns = [rrns];
      this.$match[transMod.getField("rrn")] = {
        $in: rrns.map((item) => item.toString()),
      };
    }
    return this;
  }

  setStatus(status) {
    if (status) {
      const responseCode = {};
      const opr = status === "failed" ? "$ne" : "$eq";
      responseCode[opr] = "00";
      this.$match[transMod.getField("response_code")] = responseCode;
    }
    return this;
  }

  setSearch(search) {
    const getSObj = (key) => {
      const obj = {};
      if (checkNumber(search)) obj[key] = { $eq: parseInt(search, 10) };
      else obj[key] = { $regex: getRegExp(search) };
      return obj;
    };

    if (search) {
      const $or = [];
      $or.push(getSObj(transMod.getField("terminal_id")));
      $or.push(getSObj(transMod.getField("merchant_id")));
      $or.push(getSObj(transMod.getField("merchant_name")));
      $or.push(getSObj(transMod.getField("stan")));
      $or.push(getSObj(transMod.getField("pan")));
      $or.push(getSObj(transMod.getField("rrn")));
      $or.push(getSObj(transMod.getField("prrn")));
      if (checkNumber(search)) $or.push(getSObj(transMod.getField("amount")));

      this.$match.$or = $or;
    }
    return this;
  }

  setSource(source) {
    if (source)
      this.$match[transMod.getField("handler_used")] = getRegExp(source);
    return this;
  }

  setSort(field, dir = "desc") {
    if (field) {
      const sort = {};
      sort[field] = dir === "asc" ? 1 : -1;
      this.$sort = sort;
    }
    return this;
  }

  setCountry(a2code) {
    if (a2code) this.$match.country_a2code = getRegExp(a2code);
    return this;
  }

  setSettled(status) {
    if (status) this.$match.settled = null || "unsettled";
    return this;
  }

  async vasHistory() {
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
    const $sort = {};
    $sort[transMod.getField("transaction_date")] = -1;

    this.$match['vasData'] = { $ne: null };
    const transactions = await this.Transaction.aggregate([
      { $match: this.$match },
      { $sort },
      { $skip: this.$skip },
      { $limit: this.$limit },
      { $project },
    ]);

    transactions.map((item) => {
      item.transaction_date = moment(item.transaction_date).add(1, 'hours');
      (item.brand =
        binConverter(item.panNo) !== undefined
          ? binConverter(item.panNo).brand
          : "NIL"),
        (item.bank =
          binConverter(item.panNo) !== undefined
            ? binConverter(item.panNo).bank
            : "NIL");
    });
    // const transactions = await this.Transaction.find(this.$match,).limit(this.$limit).skip(this.$skip);  
    return transactions;
  }

  async history() {
    const $project = {
      terminal_id: `$${transMod.getField('terminal_id')}`,
      amount: `$${transMod.getField('amount')}`,
      transaction_date: `$${transMod.getField('transaction_date')}`,
      merchant_id: `$${transMod.getField('merchant_id')}`,
      merchant_address: `$${transMod.getField('merchant_address')}`,
      merchant_name: `$${transMod.getField('merchant_name')}`,
      rrn: `$${transMod.getField('rrn')}`,
      online_pin: `$onlinePin`,
      transaction_type: `$transactionType`,
      merchant_category_code: `$merchantCategoryCode`,
      processing_code: '$processingCode',
      card_expiry: '$cardExpiry',
      message_reason: '$messageReason',
      recievable_amount: { $multiply: ["$amount", 0.05] },
      currency_code: `$${transMod.getField('currency_code')}`,
      pan: `$${transMod.getField('pan')}`,
      authcode: `$${transMod.getField('authcode')}`,
      stan: `$${transMod.getField('stan')}`,
      response_msg: `$${transMod.getField('response_msg')}`,
      response_code: `$${transMod.getField('response_code')}`,
      bin: `$${transMod.getField('bin')}`,
      panNo: { $substr: [`$${transMod.getField("pan")}`, 0, 6] },
      services: `$vasData.body.service`,
      processor: `$handlerUsed`,
      vTid: `$vasData.card.vTid`,
      customerRef: "$customerRef",
    };
    const $sort = {};
    $sort[transMod.getField("transaction_date")] = -1;

    const transactions = await this.Transaction.aggregate([
      { $match: this.$match },
      { $sort },
      { $skip: this.$skip },
      { $limit: this.$limit },
      { $project }
    ]);
    transactions.map((item) => {
      // item.transaction_date = moment(item.transaction_date).add(1, 'hours');
      (item.brand =
        binConverter(item.panNo) !== undefined
          ? binConverter(item.panNo).brand
          : "NIL"),
        (item.bank =
          binConverter(item.panNo) !== undefined
            ? binConverter(item.panNo).bank
            : "NIL");
    });
    const count = await this.Transaction.countDocuments(this.$match) || 0;
    return { transactions, count };
  }


  async getTransaction(filter: any, type = null) {
    let match: any = { _id: filter };

    // if (filter.maskedPan) {
    //   match.maskedPan = filter.maskedPan;
    // }

    // if (filter.amount) {
    //   match.amount = Number(filter.amount);
    // }

    let transactions: any[] = await this.Transaction.find(match).read("primary");


    let transaction: any = transactions.filter((c) => c.MTI == "0200");

    if (transaction.length == 1) transaction = transaction[0];
    else if (transaction.length == 2)
      transaction = transaction.find((c) => c.responseCode == "00");
    else transaction = null;

    let reversal = transactions.find((c) => c.MTI == "0420");

    Utils.fileDataLogger(
      filter.tid,
      `transaction : ${JSON.stringify(transactions)}`
    );

    if (!transaction) return null;

    let pan6 = transaction.maskedPan.substr(0, 6);
    let pan4 = transaction.maskedPan.substr(transaction.maskedPan.length - 4);

    let customerRef = "";
    let phone = "";
    if (transaction.customerRef && type == true) {
      customerRef = transaction.customerRef.split("~");
      phone = customerRef.length > 1 ? customerRef[1] : "";
    }

    let status = "PENDING";
    if (transaction.responseCode == "00") {
      status = "SUCCESSFUL";

      if (reversal) {
        if (reversal.responseCode == "00") {
          status = "REVERSED";
        }
      }
    } else {
      status = "FAILED";
    }


    if (!type) {
      const terminal_details = await TerminalService.getTerminal(transaction.terminalId)
      const cardType = transaction?.maskedPan
        ? Utils.getCardType(transaction.maskedPan)
        : "";
      const bank = transaction?.terminalId
        ? Utils.bankfromTID(transaction.terminalId)
        : "";


      return {
        MTI: transaction.MTI,
        processingCode: transaction.processingCode,
        amount: transaction.amount,
        terminalId: transaction.terminalId,
        statusCode: transaction.responseCode,
        maskedPan: transaction.maskedPan,
        rrn: transaction.rrn,
        STAN: transaction.STAN,
        authCode: transaction.authCode,
        transactionTime: transaction.transactionTime,
        handlerResponseTime: transaction.handlerResponseTime,
        merchantId: transaction.merchantId,
        merchantAddress: transaction.merchantAddress,
        merchantCategoryCode: transaction.merchantCategoryCode,
        messageReason: transaction.messageReason,
        responseCode: transaction.responseCode,
        notified: transaction.notified || "",
        customerRef: transaction.customerRef || "",
        transactionType: transaction.transactionType,
        vasproduct: transaction.vasproduct || "",
        scheme: cardType,
        bank,
        ...transaction.toObject(),
        ...terminal_details.toObject(),
      };
    }
    // console.log(transaction);

    let theBody = {
      amount: transaction.amount,
      terminalId: transaction.terminalId,
      referenceNumber: transaction.rrn,
      datetimeUTC: moment(transaction.transactionTime).format(
        "YYYY-MM-DDTHH:mm:ss"
      ),
      currency: "NGN",
      narration: "Card Debit",
      phoneNumber: phone,
      cardPANFirstSixDigits: pan6,
      cardPANLastFourDigits: pan4,
      responseCode: transaction.responseCode,
      responseMessage: transaction.messageReason,
      authCode: transaction.authCode,
      status: status,

    };

    Utils.fileDataLogger(
      filter.terminalId,
      `response : ${JSON.stringify(theBody)}`
    );

    return theBody;
  }

  public async getTransactionRRN(filter: any, type = null) {
    let match: any = { terminalId: filter.terminalId, rrn: filter.rrn };

    if (filter.maskedPan) {
      match.maskedPan = filter.maskedPan;
    }

    if (filter.amount) {
      match.amount = Number(filter.amount);
    }

    let transactions: any[] = await Journals.find(match).read("primary");


    let transaction: any = transactions.filter((c) => c.MTI == "0200");

    if (transaction.length == 1) transaction = transaction[0];
    else if (transaction.length == 2)
      transaction = transaction.find((c) => c.responseCode == "00");
    else transaction = null;

    let reversal = transactions.find((c) => c.MTI == "0420");

    Utils.fileDataLogger(
      filter.tid,
      `transaction : ${JSON.stringify(transactions)}`
    );

    if (!transaction) return null;

    let pan6 = transaction.maskedPan.substr(0, 6);
    let pan4 = transaction.maskedPan.substr(transaction.maskedPan.length - 4);

    let customerRef = "";
    let phone = "";
    if (transaction.customerRef && type == true) {
      customerRef = transaction.customerRef.split("~");
      phone = customerRef.length > 1 ? customerRef[1] : "";
    }

    let status = "PENDING";
    if (transaction.responseCode == "00") {
      status = "SUCCESSFUL";

      if (reversal) {
        if (reversal.responseCode == "00") {
          status = "REVERSED";
        }
      }
    } else {
      status = "FAILED";
    }


    if (!type) {
      const terminal_details = await terminalServices.getTerminal(transaction.terminalId)
      const cardType = transaction?.maskedPan
        ? Utils.getCardType(transaction.maskedPan)
        : "";
      const bank = transaction?.terminalId
        ? Utils.bankfromTID(transaction.terminalId)
        : "";


      return {
        MTI: transaction.MTI,
        processingCode: transaction.processingCode,
        amount: transaction.amount,
        terminalId: transaction.terminalId,
        statusCode: transaction.responseCode,
        maskedPan: transaction.maskedPan,
        rrn: transaction.rrn,
        STAN: transaction.STAN,
        authCode: transaction.authCode,
        transactionTime: transaction.transactionTime,
        handlerResponseTime: transaction.handlerResponseTime,
        merchantId: transaction.merchantId,
        merchantAddress: transaction.merchantAddress,
        merchantCategoryCode: transaction.merchantCategoryCode,
        messageReason: transaction.messageReason,
        responseCode: transaction.responseCode,
        notified: transaction.notified || "",
        customerRef: transaction.customerRef || "",
        transactionType: transaction.transactionType,
        vasproduct: transaction.vasproduct || "",
        scheme: cardType,
        bank,
        ...transaction.toObject(),
        ...terminal_details.toObject(),
      };
    }
    // console.log(transaction);

    let theBody = {
      amount: transaction.amount,
      terminalId: transaction.terminalId,
      referenceNumber: transaction.rrn,
      datetimeUTC: moment(transaction.transactionTime).format(
        "YYYY-MM-DDTHH:mm:ss"
      ),
      currency: "NGN",
      narration: "Card Debit",
      phoneNumber: phone,
      cardPANFirstSixDigits: pan6,
      cardPANLastFourDigits: pan4,
      responseCode: transaction.responseCode,
      responseMessage: transaction.messageReason,
      authCode: transaction.authCode,
      status: status,

    };

    Utils.fileDataLogger(
      filter.terminalId,
      `response : ${JSON.stringify(theBody)}`
    );

    return theBody;
  }

  async timeOld() {
    console.log("data serv", process.env.TZ);
    const group = {
      _id: {
        $hour: {
          date: `$${transMod.getField("transaction_date")}`,
          timezone: process.env.TZ,
        },
      },
      total: { $sum: `$${transMod.getField("amount")}` },
    };

    const rows = await this.Transaction.aggregate([
      { $match: this.$match },
      { $group: group },
    ]);

    const data = [];

    const isToday =
      moment().diff(
        (this.$match[transMod.getField("transaction_date")] || {}).$gte ||
        curDate(),
        "d"
      ) === 0;
    const hour = moment().hour();

    for (let i = 0; i < 24; i++) {
      const nullValue = isToday && i <= hour ? 0 : null;
      const allTransaction = rows.find((elem) => elem._id === i);
      const allValue = allTransaction
        ? parseInt(allTransaction.total, 10)
        : nullValue;
      data[i] = allValue;
    }

    return data;
  }


  async time(range = 'y', startdate,) {
    console.log('coming date : ', range)
    const ranges = {
      d: 'hour',
      w: 'dayOfMonth',
      m: 'dayOfMonth',
      y: 'month',
    };
    const recLen = {
      d: 24,
      w: 7,
      m: 31,
      y: 12,
    };


    const $group = {
      _id: { [`$${ranges[range]}`]: { date: '$transactionTime' } },
      total: { $sum: '$amount' },
    };

    const $facet = {
      all: [
        { $match: this.$match },
        { $group },
      ],
      success: [
        { $match: { ...this.$match, responseCode: '00' } },
        { $group },
      ],
    };

    let trans = await this.Transaction.aggregate([{ $facet }]);
    [trans = {}] = trans;
    const successTrans = trans.success;
    const allTrans = trans.all;

    const successful = [];
    const failed = [];
    const all = [];
    const reclen = recLen[range];

    const dDate = startdate;
    console.log("trans", dDate)

    const starts = {
      d: 0,
      w: moment(dDate).startOf('w').date(),
      m: moment(dDate).startOf('month').date(),
      y: 1,
    };
    const start = starts[range];
    const end = start + reclen;

    const isPresent = moment().diff(dDate, <moment.unitOfTime.DurationConstructor>(range === 'm' ? 'month' : range)) === 0;
    const nows = {
      d: moment().hour(),
      w: moment().date(),
      m: moment().date(),
      y: moment().month(),
    };
    let now = nows[range];
    if (range === 'w' && start > now) now += start;

    for (let i = start; i < end; i++) {
      const nullValue = isPresent && i > now ? null : 0;
      const allTran = allTrans.find(rec => rec._id === i) || {};
      const success = successTrans.find(rec => rec._id === i) || {};
      const aValue = allTran.total || nullValue;
      const sValue = success.total || nullValue;
      const fValue = (aValue - sValue) || nullValue;

      successful.push(sValue);
      failed.push(fValue);
      all.push(aValue);
    }

    return { all, successful, failed };
  }

  /**
   * Gets summary of transactions per type for given date
   * @param {Date} date
   */
  async summary(short = true) {
    const startDate =
      (this.$match[transMod.getField("transaction_date")] || {}).$gte ||
      curDate();

    const group = {
      _id: {
        $dayOfMonth: {
          date: `$${transMod.getField("transaction_date")}`,
          timezone: process.env.TZ,
        },
      },
      total: { $sum: { $toDouble: `$${transMod.getField("amount")}` } },
      volume: { $sum: 1 },
    };

    const project = {
      _id: 0,
      year: {
        $year: {
          date: new Date(startDate),
          timezone: process.env.TZ,
        },
      },
      month: {
        $month: {
          date: new Date(startDate),
          timezone: process.env.TZ,
        },
      },
      day: "$_id",
      total: 1,
      volume: 1,
    };

    const { $match } = this;
    $match[transMod.getField("response_code")] = "00";

    let rows = await this.Transaction.aggregate([
      { $match },
      { $group: group },
      { $project: project },
    ]);
    rows = rows.map((item) => {
      if (item.year && item.month && item.day) {
        item.date = moment(
          `${item.year}-${item.month}-${item.day}`,
          "YYYY-MM-DD"
        ).format("DD-MMM-YYYY");
      }
      return item;
    });
    rows.sort((a, b) => (a.day > b.day ? 1 : -1));

    if (short) return rows;

    $match[transMod.getField("response_code")] = { $ne: "00" };
    const failedTransactions = await this.Transaction.aggregate([
      { $match },
      { $group: group },
      { $project: project },
    ]).allowDiskUse(true);

    rows = rows.map((item) => {
      const rec: any = {
        date: moment(item.date, "DD-MMM-YYYY").format("YYYY-MM-DD"),
      };
      const failedTrans = failedTransactions.find((a) => a.day === item.day) || {};
      rec.successful_volume = item.volume || 0;
      rec.successful_value = (item.total || 0) / 100;
      rec.failed_volume = failedTrans.volume || 0;
      rec.failed_value = (failedTrans.total || 0) / 100;
      rec.total_value = rec.successful_value + rec.failed_value;
      rec.total_volume = rec.successful_volume + rec.failed_volume;
      return rec;
    });

    return rows;
  }

  /**
   * Gets transaction statistics for given start and end dates
   * @param {Date} startDate
   * @param {Date} endDate
   */
  async stat() {
    const merchant_id = this.$match[transMod.getField("merchant_id")] || null;

    const statData = await this.Transaction.aggregate([
      { $match: this.$match },
      {
        $group: {
          _id: null,
          total_value: { $sum: `$${transMod.getField("amount")}` },
          total_volume: { $sum: 1 },
          terminals: { $addToSet: `$${transMod.getField("terminal_id")}` },
        },
      },
    ]);

    const { $match } = this;
    $match[transMod.getField("response_code")] = "00";

    const successCounter = await this.Transaction.aggregate([
      { $match },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: `$${transMod.getField("amount")}` },
          count: { $sum: 1 },
        },
      },
    ]);

    const data = (statData || [])[0] || {};
    const { total_value = 0, total_volume = 0, terminals = [] } = data;
    const success_count = ((successCounter || [])[0] || {}).count || 0;
    const success_value = ((successCounter || [])[0] || {}).totalAmount || 0;
    const failed_value = total_value - success_value;

    const success_percent = parseFloat(
      ((success_count * 100) / (total_volume || 1)).toFixed(2)
    );
    const failed_count = total_volume - success_count;
    const failed_percent = parseFloat((100 - success_percent).toFixed(2));

    const terminal_count = await TerminalService.getAllCount(merchant_id);

    const utilized_terminals = terminals.length;
    const utilized_terminals_percent = parseFloat(
      ((utilized_terminals * 100) / (terminal_count || 1)).toFixed(2)
    );
    let non_utilized_terminals = terminal_count - utilized_terminals;
    non_utilized_terminals =
      non_utilized_terminals < 0 ? 0 : non_utilized_terminals;
    let non_utilized_terminals_percent = parseFloat(
      (100 - utilized_terminals_percent).toFixed(2)
    );
    non_utilized_terminals_percent =
      non_utilized_terminals_percent < 0 ? 0 : non_utilized_terminals_percent;

    return {
      total_value,
      total_volume,
      success_count,
      success_value,
      success_percent,
      failed_count,
      failed_value,
      failed_percent,
      utilized_terminals,
      utilized_terminals_percent,
      non_utilized_terminals,
      non_utilized_terminals_percent,
    };
  }

  /**
   * Gets transaction statistics for given start and end dates
   * @param {Date} startDate
   * @param {Date} endDate
   */
  async statSummary() {
    const merchant_id = this.$match[transMod.getField("merchant_id")] || null;

    const statData = await this.Transaction.aggregate([
      { $match: this.$match },
      {
        $group: {
          _id: null,
          total_value: { $sum: `$${transMod.getField("amount")}` },
        },
      },
    ]);

    const { $match } = this;
    $match[transMod.getField("response_code")] = "00";

    const successCounter = await this.Transaction.aggregate([
      { $match },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: `$${transMod.getField("amount")}` },
        },
      },
    ]);

    const data = (statData || [])[0] || {};
    const { total_value = 0 } = data;
    const success_value = ((successCounter || [])[0] || {}).totalAmount || 0;
    const failed_value = total_value - success_value;
    const ptsp = success_value * 0.005;
    const tmo = success_value * 0.005;

    return {
      total_value,
      success_value,
      failed_value,
      ptsp,
      tmo
    };
  }

  async failureReason() {
    const $group = {
      _id: { message: `$${transMod.getField("response_msg")}` },
      responses: { $sum: 1 },
    };

    const $project = {
      _id: 0,
      message: "$_id.message",
      count: "$responses",
    };

    const reasons = await this.Transaction.aggregate([
      { $match: this.$match },
      { $group },
      { $project },
      { $sort: { count: -1 } },
    ]);
    return reasons;
  }

  /**
   * This returns the aggregate transactions for every merchants for given filter in $match
   */
  async merchSummary() {
    const group = {
      _id: { merchant_id: `$${transMod.getField("merchant_id")}` },
      trans_value: { $sum: `$${transMod.getField("amount")}` },
      trans_volume: { $sum: 1 },
      active_terminals: { $addToSet: `$${transMod.getField("terminal_id")}` },
    };

    const $project = {
      _id: 0,
      merchant_id: "$_id.merchant_id",
      trans_value: "$trans_value",
      trans_volume: "$trans_volume",
      active_terminals: { $size: "$active_terminals" },
    };

    const { $match } = this;
    $match[transMod.getField("response_code")] = "00";

    let rows = await this.Transaction.aggregate([
      { $match },
      { $group: group },
      { $sort: { trans_value: -1 } },
      { $skip: this.$skip },
      { $limit: this.$limit },
      { $project },
    ]).allowDiskUse(true);

    const merchantIds = rows.map((a) => a.merchant_id);
    $match[transMod.getField("response_code")] = { $ne: "00" };
    $match[transMod.getField("merchant_id")] = { $in: merchantIds };

    const failedTransactions = await this.Transaction.aggregate([
      { $match },
      { $group: group },
      { $project },
    ]).allowDiskUse(true);

    rows = rows.map((item) => {
      const rec: any = {
        merchant_id: item.merchant_id,
        merchant_name: item.merchant_name,
      };
      const failedTrans =
        failedTransactions.find((a) => a.merchant_id === item.merchant_id) ||
        {};
      rec.successful_volume = item.trans_volume || 0;
      rec.successful_value = (item.trans_value || 0) / 100;
      rec.failed_volume = failedTrans.trans_volume || 0;
      rec.failed_value = (failedTrans.trans_value || 0) / 100;
      rec.total_value = rec.successful_value + rec.failed_value;
      rec.total_volume = rec.successful_volume + rec.failed_volume;
      return rec;
    });

    return rows;
  }

  /**
   * This returns the aggregate transactions for every merchants for given dates
   * It does same for previous date range and compare to get value and volume changes
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {String} sort - Field to sort with
   * @param {String} dir - Sort direction
   * @param {Number} page
   * @param {Number} limit
   */
  async performance(type = "merchant") {
    const $group: any = {
      trans_value: { $sum: `$${transMod.getField("amount")}` },
      trans_volume: { $sum: 1 },
    };

    const $project: any = {
      _id: 0,
      merchant_name: 1,
      trans_value: "$trans_value",
      trans_volume: "$trans_volume",
    };
    console.log("group :: ", $group);

    if (type === "merchant") {
      $group._id = { merchant_id: `$${transMod.getField("merchant_id")}` };
      $group.active_terminals = {
        $addToSet: `$${transMod.getField("terminal_id")}`,
      };
      $group.merchant_name = {
        $first: `$${transMod.getField("merchant_name")}`,
      };

      $project.merchant_id = "$_id.merchant_id";
      $project.active_terminals = { $size: "$active_terminals" };
    } else {
      $group._id = { terminal_id: `$${transMod.getField("terminal_id")}` };

      $project.terminal_id = "$_id.terminal_id";
    }

    const totalGroup: any = {
      _id: null,
      total_volume: { $sum: "$trans_volume" },
      total_value: { $sum: "$trans_value" },
    };

    const $facet: any = {
      rows: [{ $skip: this.$skip }, { $limit: this.$limit }],
      total: [{ $group: totalGroup }],
    };

    const pipelines: any = [{ $match: this.$match }, { $group }, { $project }];

    if (this.$sort) {
      // pipelines.push({ $sort: this.$sort });
    }
    pipelines.push({ $facet });

    let transData = await this.Transaction.aggregate(pipelines).allowDiskUse(
      true
    );
    [transData = {}] = transData;

    const transactions = transData.rows || [];
    const summary = { ...(transData.total || [])[0] };
    delete summary._id;

    return { transactions, summary };
  }

  /**
   * Get Terminals statistics from transactions, online or active terminal count
   * @param {String} type - can be 'online' or 'active'
   */
  async transTermStat(type, merchant_id = null) {
    let secs = 0;
    if (type === "active")
      secs = 7 * 24 * 60 * 60;
    else
      secs = 30;

    const last = new Date(new Date().getTime() - secs * 1000);
    const { $match } = this;
    $match[transMod.getField("transaction_date")] = { $gt: last };
    if (merchant_id) $match[transMod.getField("merchant_id")] = merchant_id;

    const stat = await this.Transaction.aggregate([
      { $match },
      { $group: { _id: { terminal: `$${transMod.getField("terminal_id")}` } } },
      { $count: "count" },
    ]);

    return ((stat || [])[0] || {}).count || 0;
  }

  async terminalIDs() {
    const { $match } = this;
    const trans = await this.Transaction.aggregate([
      { $match },
      { $group: { _id: `$${transMod.getField("terminal_id")}` } },
    ]);
    return trans.map((item) => item._id);
  }

  /**
   * Gets summary of transactions per type for given date
   * @param {Date} date
   */
  async bankSummary(type = "month") {
    const endDate = this.$match[transMod.getField("transaction_date")].$lte;
    const startDate = this.$match[transMod.getField("transaction_date")].$gte;

    const group = {
      _id: {
        day: {
          $dayOfMonth: {
            date: `$${transMod.getField("transaction_date")}`,
            timezone: process.env.TZ,
          },
        },
        terminal: `$${transMod.getField("terminal_id")}`,
      },
      total: { $sum: { $toDouble: `$${transMod.getField("amount")}` } },
      volume: { $sum: 1 },
      bank: {
        $addToSet: { $substr: [`$${transMod.getField("terminal_id")}`, 0, 4] },
      },
    };

    const project = {
      _id: 0,
      year: {
        $year: {
          date: new Date(startDate),
          timezone: process.env.TZ,
        },
      },
      month: {
        $month: {
          date: new Date(startDate),
          timezone: process.env.TZ,
        },
      },
      day: "$_id.day",
      total: 1,
      total_settlement: 1,
      volume: 1,
      charge: 1,
      terminal: "$_id.terminal",
      bank: "$_id.bank",
    };

    const group2 = {
      _id: {
        bank: "$bank",
        day: "$_id.day",
      },
      total: { $sum: { $toDouble: "$total" } },
      volume: { $sum: "$volume" },
    };

    let rows = await this.Transaction.aggregate([
      { $match: this.$match },
      { $group: group },
      { $unwind: "$bank" },
      { $group: group2 },
      { $project: project },
    ]).allowDiskUse(true);
    rows.sort((a, b) => (a.day > b.day ? 1 : -1));

    if (type === "d" && !rows.length) {
      rows.push({
        year: moment(startDate).year(),
        month: moment(startDate).month() + 1,
        day: moment(startDate).date(),
        total: 0,
        total_settlement: 0,
        volume: 0,
        charge: 0,
      });
    } else if (type !== "d") {
      const startDay = moment(startDate).date();
      const endDay = moment(endDate).date();
      for (let i = startDay; i <= endDay; i++) {
        if (!rows.find((item) => item.day === i)) {
          rows.push({
            year: moment(endDate).date(i).year(),
            month: moment(endDate).date(i).month() + 1,
            day: i,
            total: 0,
            total_settlement: 0,
            volume: 0,
            charge: 0,
          });
        }
      }
    }

    rows = rows.map((item) => {
      if (item.year && item.month && item.day) {
        item.date = moment(
          `${item.year}-${item.month}-${item.day}`,
          "YYYY-MM-DD"
        ).format("DD-MMM-YYYY");
      }
      return item;
    });

    return rows;
  }

  /**
   * get transaction for settlement record for reconciiation
   * @param {*} terminals
   * @param {*} rrns
   * @returns transaction record
   */
  async getTIDsRRNsTrans() {
    const $sort = {};
    $sort[transMod.getField("transaction_date")] = -1;

    const transactions = await this.Transaction.aggregate([
      { $match: this.$match },
      { $sort },
    ]);
    return transactions;
  }

  /**
   * get a single transaction record with it rrn
   * @param {*} rrn
   * @returns transaction record
   */
  async singleCardTransactionHistory() {
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
      bin: `$${transMod.getField('bin')}`,
      settled: `$settled`,
      panNo: { $substr: [`$${transMod.getField('pan')}`, 0, 6] },
      services: `$vasData.body.service`,
      processor: `$handlerUsed`,
      vTid: `$vasData.card.vTid`,
      customerRef: "$customerRef",
    };
    const transaction = await this.Transaction.aggregate([
      { $match: this.$match },
      { $project },
    ]);
    //console.log('transaction.length: ', transaction.length);
    if (transaction.length < 1) return null;
    transaction.transaction_date = moment(transaction.transaction_date).add(1, 'hours');
    transaction.brand = binConverter(transaction.panNo) !== undefined ? binConverter(transaction.panNo).brand : 'NIL';
    transaction.bank = binConverter(transaction.panNo) !== undefined ? binConverter(transaction.panNo).bank : 'NIL';
    return transaction[0];
  }


  /**
   * get terminal(s) belonging to a wallet id
   * @param {*} walletId
   */
  async getWalletTid(walletId) {
    const transaction = await this.Transaction.aggregate([
      // { $match: { "vasData.wallet" : {$ne : null}} },
      { $match: { "customerRef": { $regex: walletId.trim() } } },
      { $sort: { _id: -1 } },
      { $limit: 1 },
      { $project: { terminalId: 1, _id: 0 } },
    ]);
    return transaction[0]
  }

  /**
   * get card scheme summary by bank belonging to a wallet id
   * @param {*} 
   */

  async getCardSchemeSummary() {
    const totalTransactions = await this.Transaction.aggregate([
      {
        $match: this.$match
      },
      {
        $addFields:
        {
          "bank": { $substr: [`$maskedPan`, 0, 6] },
        }
      },
      {
        $group:
        {
          _id: { bank: '$bank', responseCode: '$responseCode' },
          totalTrans: {
            $sum: 1
          }
        }
      }
    ]).allowDiskUse(true);

    // const summary = await this.Transaction.aggregate([
    //   {
    //     $match: {
    //       customerRef: { $regex: walletId },
    //       responseCode: "00"
    //     }
    //   },
    //   {
    //     $addFields:
    //     {
    //       "bank": { $substr: [`$maskedPan`, 0, 6] },
    //     }
    //   },
    //   {
    //     $group:
    //     {
    //       _id: {bank : '$bank'},
    //       totalTrans: {
    //         $sum: 1
    //       }
    //     }
    //   }
    // ]).allowDiskUse(true);

    // let banks = {};

    // for(let i= 0; i < totalTransactions.length; i++){
    //   let name = binConverter(totalTransactions[i]._id.bank) !== undefined ? binConverter(totalTransactions[i]._id.bank).bank : 'NIL';
    //   let brand = binConverter(totalTransactions[i]._id.bank) !== undefined ? binConverter(totalTransactions[i]._id.bank).brand : 'NIL';
    //   banks.bank =name;
    //   banks.card = brand;
    // }

    let result = totalTransactions.map(item => {
      item.bankName = binConverter(item._id.bank) !== undefined ? binConverter(item._id.bank).bank : 'NIL';
      item.bankCard = binConverter(item._id.bank) !== undefined ? binConverter(item._id.bank).brand : 'NIL';
      return item;
    })

    console.log('result of total transaction with banks:', result);
  }

  async getQueryTotalForDownload() {
    let total = await this.Transaction.aggregate([
      { $match: this.$match },
      {
        $group: {
          _id: 0,
          count: { $sum: 1 }
        }
      }
    ]);
    //console.log("total: ", total);
    const count = total[0].count;
    //console.log("count :", count)

    if (count > 0) {
      let filename = await generateFilename();
      process.env.gen_files = (process.env.gen_files || "") + filename + ","

      return { total: count, filename: filename }
    }
    return false;
  }

  async generateReportTlm(total = 0, filename = "") {
    let filePath = `files/${filename}`;
    let workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ filename: filePath, useStyles: true, useSharedStrings: true });
    workbook.creator = "Bizzdesk System";

    let workSheet = workbook.addWorksheet("transaction Report");
    // workSheet.columns = [];
    workSheet.columns = Utils.getReportHeaders() as any;
    console.log("total", total)
    let pages = Math.ceil((total + 5000) / 5000);

    let index = 0;

    try {
      while (index != pages) {
        let txn = await this.Transaction.aggregate([
          { $match: this.$match },
          { $skip: index * 5000 },
          { $limit: 5000 },
        ]);
        console.log("data for adding: ", txn.length);
        // find({}).skip(index * 5000).limit(5000);
        console.log("index " + index + " pages : " + pages);
        if (txn.length) {
          txn.forEach((t) => {
            console.log(t.transactionTime)
            workSheet.addRow(t).commit();
          })
        }

        index += 1;
      }
      await workbook.commit();
      console.log("done");
    } catch (error) {
      console.error(`error generating report ${filename}, err: ${error}`);
    } finally {
      console.log("clean");
      let gen_file = process.env.gen_files;
      gen_file = gen_file.replace(filename + ",", "");
      process.env.gen_files = gen_file;
    }

    removeFile(filePath);
    return filename;
  }



  public async checkLastTransaction(terminalId: string) {

    const filter = {
      terminalId: terminalId,
      startdate: moment().format("YYYY-MM-DD").replace(/-/g, ""),
      enddate: moment().format("YYYY-MM-DD").replace(/-/g, ""),

    };


    const today = new Date();

    // let match: any = await this.buildQuery(filter);
    let match: any = {};
    match.responseCode = "00"

    const transactions = await Journals.find(match).read("secondary");

    const transactionVolume = transactions.map((i: any) => {
      if (today.toDateString() === new Date(i.transactionTime).toDateString()) {
        return i.amount;
      }
    });

    return transactionVolume.reduce((a, b) => a + b, 0);
  }

  public async getGeneratedFile(data: any) {
    let pendingFiles = process.env.gen_files || "";

    if (pendingFiles) {
      if (pendingFiles.includes(data.filename)) {
        return "pending";
      }
    }

    let file: any = "";
    try {
      file = await Promise.race([
        new Promise((resolve, reject) => {
          let x = setTimeout(() => {
            clearTimeout(x);
            reject("pending");
          }, 1 * 1000);
        }).then(),

        new Promise((resolve, reject) => {
          Utils.pullFile(data.filename)
            .then((data) => {
              resolve(data);
            })
            .catch((err) => {
              reject(err);
            });
        }),
      ]);
    } catch (error) {
      return "pending";
    }
    return file;
  }

}

export default TransactionService;