import moment from "moment";
import Utils from "../helpers/utils";
import Journals from "../db/model/journal.model";
import VasJournals from "../db/model/vasjournals.model";
import Excel from "exceljs";
import TerminalServices from "../services/terminal.services";

interface ITransactionServices {
  getTransaction(filter: any, type: any): any;

  getTransactions(filter: any): any;
  getTransactionsTlm(
    filter: any,
    download: any,
    total: any,
    filename: any
  ): any;
  generateReportTlm(filter: any, download: any, total: any, filename: any): any;
  getVasTransactions(
    filter: any,
    download: any,
    total: any,
    filename: any
  ): any;

  getQueryTotalForDownload(filter: any): any;
  getGeneratedFile(data: any): any;
  CardReport3Transactions(): any;
  CheckFor3dayTransaction(): any;
  CheckFor20PercentCount(): any;

  Check50PercentSingeCardTransactions(): any;
  CheckForSameTimeTransaction(): any;
  findTransactionForReceipt(trnx: any): any;
}

class TransactionServices implements ITransactionServices {
  public async getTransaction(filter: any, type = null) {
    let match: any = { terminalId: filter.terminalId, rrn: filter.reference };

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
      const terminal_details = await TerminalServices.getTerminal(transaction.terminalId)
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

  public async getTransactions(filter: any) {
    // console.log(filter);

    let match: any = {};
    match.terminalId = filter.terminalId;

    if (filter.status) {
      match.responseCode = filter.status;
    }

    if (filter.mti) {
      match.MTI = filter.mti;
    }

    let date = Utils.setRange({}, filter);
    match.transactionTime = date.createdAt;

    filter = Utils.setPaging(filter);

    // console.log(match);

    let query = [];

    if (
      filter["walletId"] !== undefined &&
      filter["merchantcode"] !== undefined &&
      match.terminalId === undefined
    ) {
      let merchantterminals =
        await TerminalServices.getAllTerminalsByMerchantCode(
          filter["merchantcode"],
          filter["walletId"]
        );

      if (!merchantterminals) return {};

      merchantterminals = Utils.convertTermninalsArrayObject(merchantterminals);

      match.terminalId = { $in: [...merchantterminals] };

      query = [
        { $match: match },
        { $sort: { transactionTime: -1 } },
        { $skip: filter.skip },
        { $limit: filter.pageSize },
      ];
    } else {
      query = [
        { $match: match },
        { $sort: { transactionTime: -1 } },
        { $skip: filter.skip },
        { $limit: filter.pageSize },
      ];
    }

    // TODO: Add transactions summary to the query results

    let transactions = await Journals.aggregate(query)
      .allowDiskUse(true)
      .read("secondary");

    return transactions;
  }

  public async getTransactionsTlm(filter: any) {
    filter?.status === "success"
      ? (filter.responseCode = "00")
      : filter?.status === "failed"
        ? (filter.responseCode = { $ne: "00" })
        : "";

    let match: any = await this.buildQuery(filter);
    let transactions = null;
    let ser = [];

    console.log(filter, match);
    if (filter.summary !== "true") {
      filter = Utils.setPaging(filter);

      transactions = await Journals.find(match)
        .skip(filter.skip)
        .read("secondary");

      transactions.map((transaction: any) => {
        if (transaction) {
          const PTSPFee = 0.0005 * (parseFloat(transaction.amount) / 100);
          const TMOfee = 0.0005 * (parseFloat(transaction.amount) / 100);
          const bank = transaction?.terminalId
            ? Utils.bankfromTID(transaction.terminalId)
            : "";
          const cardType = transaction?.maskedPan
            ? Utils.getCardType(transaction.maskedPan)
            : "";
          ser.push({
            ...transaction.toObject(),
            PTSPFee,
            TMOfee,
            bank,
            cardType,
          });
        }
      });

      return ser;
    } else {
      transactions = await Journals.find(match).read("secondary");

      let summary = this.doSummary(transactions, match.MTI);
      return { summary };
    }
  }
  public async getTransactionsRRN(filter: any) {
    filter?.status === "success"
      ? (filter.responseCode = "00")
      : filter?.status === "failed"
        ? (filter.responseCode = { $ne: "00" })
        : "";

    let match: any = await this.buildQuery(filter);
    let transactions = null;

    if (filter.summary !== "true") {
      filter = Utils.setPaging(filter);

      transactions = await Journals.find(match)
        .skip(filter.skip)
        .read("secondary");

      return { transactions };
    } else {
      transactions = await Journals.find(match).read("secondary");

      let summary = this.doSummary(transactions, match.MTI);
      return { summary };
    }
  }

  public async getVasTransactions(filter: any) {
    // console.log(filter)

    let match: any = this.buildVasQuery(filter);
    let transactions = null;

    if (filter.summary !== "true") {
      filter = Utils.setPaging(filter);
      transactions = await VasJournals.find(
        match,
        "-__v -extraFields -encryptedData"
      )
        .skip(filter.skip)
        .limit(filter.pageSize)
        .read("secondary");
      return { transactions };
    } else {
      transactions = await VasJournals.find(
        match,
        "-__v -extraFields -encryptedData"
      ).read("secondary");
      let summary = this.doSummaryVas(transactions);
      return { summary };
    }
  }

  public async generateReportTlm(
    filter: any,
    download = false,
    total = 0,
    filename = "",
    type = "tlm"
  ) {
    let match =
      type === "tlm" ? this.buildQuery(filter) : this.buildVasQuery(filter);

    let filePath = `Report/${filename}`;
    let workbook = new Excel.stream.xlsx.WorkbookWriter({
      filename: filePath,
      useStyles: true,
      useSharedStrings: true,
    });
    workbook.creator = "IMS";

    let workSheet: any = workbook.addWorksheet("transaction Report");
    workSheet.columns = Utils.getReportHeaders();

    let pages = Math.ceil((total + 5000) / 5000);

    let index = 0;
    try {
      while (index != pages) {
        let txn = await Journals.find(match)
          .skip(index * 5000)
          .limit(5000)
          .read("secondary");
        console.log("index " + index + " pages : " + pages);
        if (txn.length) {
          txn.forEach((t) => {
            workSheet.addRow(t).commit();
          });
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

    Utils.removeFile(filePath);
    return filename;
  }

  public async getQueryTotalForDownload(filter: any) {
    let match = this.buildQuery(filter);
    let total = await Journals.find(match).countDocuments().read("secondary");

    if (total > 0) {
      let filename = await Utils.generateFilename();
      process.env.gen_files = (process.env.gen_files || "") + filename + ",";

      return { total: total, filename: filename };
    }
    return false;
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

  private doSummary(transactions, mti = "0200") {
    const count = transactions.length;

    let all = 0.0;
    let success = 0.0;
    let fail = 0.0;

    let countSuccess = 0;
    let countFailed = 0;

    let PTSP = 0.0;
    let TMO = 0.0;

    transactions.map((i) => {
      if (i.amount !== undefined) {
        all += parseFloat(i.amount) / 100;
        if (i.responseCode === "00" && i.MTI === mti) {
          success += parseFloat(i.amount) / 100;
          countSuccess += 1;
          PTSP += 0.0005 * (parseFloat(i.amount) / 100);
          TMO += 0.0005 * (parseFloat(i.amount) / 100);
        } else if (i.responseCode !== "00" && i.MTI === mti) {
          fail += parseFloat(i.amount) / 100;
          countFailed += 1;
        } else {
        }
      }
    });

    return {
      all,
      count,
      success,
      fail,
      PTSP,
      TMO,
      countFailed,
      countSuccess,
    };
  }

  private doSummaryVas(transactions) {
    const count = transactions.length;
    let all = 0.0;
    let success = 0.0;
    let fail = 0.0;

    let totalCommission = 0.0;

    let totalMerchantCommision = 0.0;

    let countSuccess = 0;
    let countFailed = 0;

    transactions.map((i) => {
      if (i.amount !== undefined) {
        all += parseFloat(i.amount);
        if (i.responseCode === "0") {
          totalCommission += parseFloat(i.commission);
          totalMerchantCommision += parseFloat(i.merchantCommission);

          success += parseFloat(i.amount);
          countSuccess += 1;
        } else {
          fail += parseFloat(i.amount);
          countFailed += 1;
        }
      }
    });

    return {
      all,
      count,
      success,
      fail,
      countFailed,
      countSuccess,
      totalCommission,
      totalMerchantCommision,
    };
  }

  private async buildQuery(filter: any) {
    let match: any = {};

    if (filter.handler) {
      match.handlerUsed = filter.handler.trim();
    }

    if (filter.transactionType) {
      match.transactionType = filter.transactionType.trim();
    }

    if (filter.terminalModel) {
      match.terminalModel = filter.terminalModel.trim();
    }

    if (filter.vasproduct) {
      match.vasproduct = filter.vasproduct.trim();
    }

    if (filter.terminalId) {
      let len = filter.terminalId.length;
      if (len < 8) {
        match.terminalId = { $regex: filter.terminalId };
      } else {
        match.terminalId = filter.terminalId.trim();
      }
    }

    if (filter.status) {
      match.responseCode = filter.status.trim();
    }

    if (filter.mti) {
      if (filter.mti == "vas") {
        match.vasData = { $exists: true, $ne: null };
      }

      match.MTI = filter.mti.trim();
    } else {
      match.MTI = "0200";
    }

    if (["paper", "e-receipt"].includes(filter.receipt)) {
      match.receipt = filter.receipt;
    }

    if (filter.startdate) {
      match.transactionTime = {
        $gte: moment(filter.startdate, "YYYYMMDD")
          .tz("Africa/Lagos")
          .startOf("day")
          .toDate(),
      };
    } else {
      match.transactionTime = {
        $gte: moment().tz("Africa/Lagos").startOf("day").toDate(),
      };
    }

    if (filter.enddate) {
      match.transactionTime.$lt = moment(filter.enddate, "YYYYMMDD")
        .tz("Africa/Lagos")
        .endOf("day")
        .toDate();
    } else {
      match.transactionTime.$lt = moment()
        .tz("Africa/Lagos")
        .endOf("day")
        .toDate();
    }

    if (filter.rrn) {
      match.rrn = filter.rrn.trim();
    }
    if (filter.responseCode) {
      match.responseCode = filter.responseCode;
    }

    if (filter.merch) {
      let merch = filter.merch.trim();
      if (merch) match.merchantName = { $regex: merch };
    }

    if (filter.maskedPan) {
      match.maskedPan = { $regex: filter.maskedPan.trim() };
    }

    if (filter.amount) {
      if (Number(filter.amount.trim()) != NaN)
        match.amount = Number(filter.amount.trim());
    }

    if (filter.refCode) {
      match.customerRef = { $regex: filter.refCode.trim() };
    }

    if (filter.receipt) {
      match.receipt = filter.receipt;
    }

    if (
      filter["walletId"] !== undefined &&
      filter["merchantcode"] !== undefined
    ) {
      if (filter.terminalId === undefined) {
        let merchantterminals =
          await TerminalServices.getAllTerminalsByMerchantCode(
            filter["merchantcode"],
            filter["walletId"]
          );

        if (!merchantterminals) return {};

        merchantterminals =
          Utils.convertTermninalsArrayObject(merchantterminals);

        match.terminalId = { $in: [...merchantterminals] };
      } else {
        // match.terminalId = filter.terminalId;
        let len = filter.terminalId.length;
        if (len < 8) {
          match.terminalId = { $regex: filter.terminalId };
        } else {
          match.terminalId = filter.terminalId.trim();
        }
      }
    } else if (
      filter["walletId"] === undefined &&
      filter["merchantcode"] !== undefined
    ) {
      if (filter.terminalId === undefined) {
        let merchantterminals =
          await TerminalServices.getAllTerminalsByMerchantCode(
            filter["merchantcode"]
          );

        if (!merchantterminals) return {};

        merchantterminals =
          Utils.convertTermninalsArrayObject(merchantterminals);

        match.terminalId = { $in: [...merchantterminals] };
      } else {
        // match.terminalId = filter.terminalId;
        let len = filter.terminalId.length;
        if (len < 8) {
          match.terminalId = { $regex: filter.terminalId };
        } else {
          match.terminalId = filter.terminalId.trim();
        }
      }
    }

    // console.log("match => ", match);

    return match;
  }

  private buildVasQuery(filter: any) {
    let match: any = {};

    if (filter.beneficiaryNumber) {
      let len = filter.beneficiaryNumber.length;
      if (len < 8) {
        match.beneficiaryNumber = { $regex: filter.beneficiaryNumber };
      } else {
        match.beneficiaryNumber = filter.beneficiaryNumber.trim();
      }
    }

    if (filter.channel) {
      match.channel = filter.channel.trim();
    }

    if (filter.product) {
      match.product = filter.product.trim();
    }

    if (filter.status) {
      match.responseCode = filter.status.trim();
    }

    if (filter.walletId) {
      match.walletId = filter.walletId.trim();
    }

    if (filter.merchantCode) {
      match.merchantCode = filter.merchantCode.trim();
    }

    if (filter.providerName) {
      match.providerName = filter.providerName.trim();
    }

    if (filter.startdate) {
      match.transactionTime = {
        $gte: moment(filter.startdate, "YYYYMMDD")
          .tz("Africa/Lagos")
          .startOf("day")
          .toDate(),
      };
    } else {
      match.transactionTime = {
        $gte: moment().tz("Africa/Lagos").startOf("day").toDate(),
      };
    }

    if (filter.enddate) {
      match.transactionTime.$lt = moment(filter.enddate, "YYYYMMDD")
        .tz("Africa/Lagos")
        .endOf("day")
        .toDate();
    } else {
      match.transactionTime.$lt = moment()
        .tz("Africa/Lagos")
        .endOf("day")
        .toDate();
    }

    if (filter.transactionId) {
      match.transactionId = filter.transactionId.trim();
    }

    if (filter.sessionId) {
      match.sessionId = { $regex: filter.sessionId.trim() };
    }

    if (filter.amount) {
      if (Number(filter.amount.trim()) != NaN)
        match.amount = Number(filter.amount.trim());
    }
    console.log(match);

    return match;
  }

  /**
   * card report
   */
  public async CardReport3Transactions() {
    let attrs = [];
    let frst = await this.CheckFor3dayTransaction();

    let second = await this.CheckFor20PercentCount();

    let third = await this.CheckForSameTimeTransaction();

    let fourth = await this.Check50PercentSingeCardTransactions();

    if (frst) attrs.push(frst);
    if (second) attrs.push(second);
    if (third) attrs.push(third);
    if (fourth) attrs.push(fourth);

    if (!attrs.length) return;

    // EmailService.SendAbnormalTranxReport(attrs).then((info)=>{
    //     console.log(`abnormal trnasactions report sent`);
    //     console.log(JSON.stringify(info));
    // }).catch(err=>{
    //     console.error(`error sending abnormal trnasactions report, ${err}`);
    // })
  }

  /**
   * check if a card was used to do 3 times on the same terminal in the last 3 days
   */
  public async CheckFor3dayTransaction() {
    let date = moment();
    let start = date.subtract(3).startOf("day").toDate();
    let end = date.endOf("day").toDate();

    const data = await Journals.aggregate([
      {
        $match: {
          MTI: "0200",
          responseCode: "00",
          transactionTime: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            terminalId: "$terminalId",
            pan: "$maskedPan",
            merchantId: "$merchantId",
          },
          volume: { $addToSet: "$amount" },
          amount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          terminalId: "$_id.terminalId",
          pan: "$_id.pan",
          merchantId: "$_id.merchantId",
          volume: { $size: "$volume" },
          amount: "$amount",
        },
      },
      // {$limit : 200}
    ])
      .allowDiskUse(true)
      .read("secondary");

    const trnxs = data.filter((c) => c.volume >= 3);
    // if(!trnxs.length) return false;

    return Utils.generateForTrans(trnxs, "3-transactions-from-single-card");
  }

  public async CheckFor20PercentCount() {
    let date = moment().subtract(1, "day");
    let start = date.subtract(3).startOf("day").toDate();
    let end = date.endOf("day").toDate();

    const data = await Journals.aggregate([
      {
        $match: {
          MTI: "0200",
          responseCode: "00",
          transactionTime: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            terminalId: "$terminalId",
            pan: "$maskedPan",
            merchantId: "$merchantId",
          },
          volume: { $addToSet: "$amount" },
          amount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          terminalId: "$_id.terminalId",
          pan: "$_id.pan",
          merchantId: "$_id.merchantId",
          volume: { $size: "$volume" },
          amount: "$amount",
        },
      },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let terminals = data.map((c) => c.terminalId);
    terminals = [...new Set(terminals)];

    let flagged = [];

    for (let index = 0; index < terminals.length; index++) {
      const tm = terminals[index];
      const trans = data.filter((c) => c.terminalId == tm);
      const totalVolume = Utils.sumObjectProp(trans, "volume");
      const totalAmount = Utils.sumObjectProp(trans, "amount");

      trans.forEach((pan) => {
        const per = (pan.volume / totalVolume) * 100;
        if (per >= 20 && pan.volume > 3) {
          pan.totalVolume = totalVolume;
          pan.totalAmount = totalAmount;
          flagged.push(pan);
        }
      });
    }

    // if(!flagged.length) return false;

    return Utils.generateForTrans(
      flagged,
      "20-precent-transactions-from-single-card-in-3-days"
    );
  }

  public async Check50PercentSingeCardTransactions() {
    let date = moment();
    let start = date.startOf("day").toDate();
    let end = date.endOf("day").toDate();

    const data = await Journals.aggregate([
      {
        $match: {
          MTI: "0200",
          responseCode: "00",
          transactionTime: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            terminalId: "$terminalId",
            pan: "$maskedPan",
            merchantId: "$merchantId",
          },
          volume: { $addToSet: "$amount" },
          amount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          terminalId: "$_id.terminalId",
          pan: "$_id.pan",
          merchantId: "$_id.merchantId",
          volume: { $size: "$volume" },
          amount: "$amount",
        },
      },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let terminals = data.map((c) => c.terminalId);
    terminals = [...new Set(terminals)];

    let flagged = [];

    for (let index = 0; index < terminals.length; index++) {
      const tm = terminals[index];
      const trans = data.filter((c) => c.terminalId == tm);
      const totalVolume = Utils.sumObjectProp(trans, "volume");
      const totalAmount = Utils.sumObjectProp(trans, "amount");

      trans.forEach((pan) => {
        const per = (pan.volume / totalVolume) * 100;
        if (per >= 50 && pan.volume > 3) {
          pan.totalVolume = totalVolume;
          pan.totalAmount = totalAmount;
          flagged.push(pan);
        }
      });
    }

    // if(!flagged.length) return false;

    return Utils.generateForTrans(
      flagged,
      "50-precent-transactions-from-single-card-in-a-day"
    );
  }

  public async CheckForSameTimeTransaction() {
    let date = moment();
    let start = date.startOf("day").toDate();
    let end = date.endOf("day").toDate();

    let transactions = await Journals.aggregate([
      {
        $match: {
          MTI: "0200",
          responseCode: "00",
          transactionTime: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { pan: "$maskedPan", transactionTime: "$transactionTime" },
          trans: { $addToSet: { terminalId: "$terminalId", rrn: "$rrn" } },
        },
      },
      {
        $project: {
          _id: 0,
          pan: "$_id.pan",
          transactionTime: "$_id.transactionTime",
          trxns: "$trans",
          count: { $size: "$trans" },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ])
      .allowDiskUse(true)
      .read("secondary");

    if (!transactions.length) return false;

    return Utils.generateForSameTimeTrans(
      transactions,
      "concurrent-transaction-with-same-card"
    );
  }

  ///////////

  public async findTransactionForReceipt(trnx: {
    amount: number;
    mti: any;
    tid: any;
    mPan: any;
    rrn: any;
  }) {
    let amount = trnx.amount * 100;
    return await Journals.findOne({
      MTI: trnx.mti,
      terminalId: trnx.tid,
      maskedPan: trnx.mPan,
      amount: amount,
      rrn: trnx.rrn,
    }).read("secondary");
  }

  public async checkLastTransaction(terminalId: string) {

    const filter = {
      terminalId: terminalId,
      startdate: moment().format("YYYY-MM-DD").replace(/-/g, ""),
      enddate: moment().format("YYYY-MM-DD").replace(/-/g, ""),

    };


    const today = new Date();

    let match: any = await this.buildQuery(filter);
    match.responseCode = "00"

    const transactions = await Journals.find(match).read("secondary");

    const transactionVolume = transactions.map((i: any) => {
      if (today.toDateString() === new Date(i.transactionTime).toDateString()) {
        return i.amount;
      }
    });

    return transactionVolume.reduce((a, b) => a + b, 0);
  }

  // static async sendEreceipt(data){
  //     let res = {
  //         err : false,
  //         msg : "sent successfully"
  //     }
  //     let trxn = await this.findTransactionForReceipt(data);
  //     if(!trxn){
  //         res.err = true;
  //         res.msg = "invalid transaction"
  //     }

  //     let eReceipt = new EReceiptService(data);

  //     let result = await eReceipt.sendNotification();
  //     return result;
  // }
}

export default new TransactionServices();
