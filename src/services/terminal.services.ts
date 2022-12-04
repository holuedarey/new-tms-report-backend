import moment from "moment";
import Utils from "../helpers/utils";
import Mapper from "../helpers/mapper";
import TerminalConfig from "../db/model/terminalConfigs.model";
import TerminalStates from "../db/model/terminalStates.model";
import StateDataModel from "../db/model/stateData.model";
import TerminalKeys from "../db/model/terminalkeys.model";
import HostConfig from "../db/model/hostConfigs.model";
import MerchantModel from "../db/model/merchantSummary.model";
import TransactionServices from "./transaction.services";
import UpdateModel from "../db/model/remote.update"
import { ITerminal, IUpdate } from "../interfaces/db.models";
import path from 'path';
import ExcelJS from 'exceljs';
import { getTerminalHeaders, checkNumber, generateFilename, getReportHeaders, removeFile, curDate, getRegExp, binConverter, generateFilenameTerminal } from "../helpers/util";


interface ITerminalServices {
  // Config

  assignTerminalSingle(data: object, merchantCode: string): any;
  assignTerminalBulk(data: object[]): any; // Batch Deploy
  updateTerminalSingle(data: object, params: any, query: any): any;
  deleteTerminal(serialNumber: string): any;
  enableordisableTerminal(serialNumber: string, action: string): any;

  validateTerminalBySerialNumber(serialNumber: string, terminalId: string): any;

  // Reports

  getlast2DaysActiveTerminals(filter: any): any;
  getlast2DaysActiveTerminalsReport(filter: any): any;

  getAllTerminalsByMerchantCode(merchantcode: string): any;

  getHealthCheckPatternForTerminals(merchantcode: string, filter: any): any;
  getTerminalLocationPatternTerminals(filter: any): any;
  getActiveInactiveVolumeReports(filter: any): any;
  getActiveInactiveCountReports(filter: any): any;

  // getInactiveStatisticsReports(): any;
  getPrinterStatusCount(filter: any): any;

  getPrinterStatusReports(filter: any): any;

  getSignalStatusCount(filter: any): any;
  getSignalStatusReport(filter: any): any;

  getBatteryLevelCount(filter: any): any;
  getBatteryLevelReport(filter: any): any;

  getTerminalsStates(filter: any): any;

  getArchivedTerminals(filter: any): any;
}

class TerminalServices implements ITerminalServices {
  private match;
  constructor() {
    this.match = {};
  }

  public async getAllTerminalsByMerchantCodeNotAssignedToWallet(
    merchantCode: string,
    filter: any
  ) {
    const queryFilter = Utils.setPaging(filter);

    const data = await TerminalConfig.find({
      merchantCode,
      $or: [{ walletId: null }, { walletId: "" }],
    })
      .skip(queryFilter.skip)
      .limit(queryFilter.pageSize);

    return { data, page: queryFilter.page, pageSize: queryFilter.page };
  }

  public async getAllTerminalsByMerchantCode(merchantCode: any, params = null) {

    const query: any = {};


    if (params) {
      if (params.walletId) query.walletId = params.walletId;

      if (params.terminalId) query.terminalId = params.terminalId;

      if (params.active === "true") params.enabled = true;
      //  {
      //   params.enabled = true;
      //   params.terminalId = { $nin: ["", null] };
      // }
      if (params.active === "false") params.enabled = false;
      // {

      //   params.terminalId = { $in: ["", null] };
      // }


      params.merchantCode = merchantCode;
      delete params.active;
    }
    console.log("payload:", params)


    const terminals = await TerminalConfig.find({ ...params });



    let terminal = terminals
      .map((i: any) => i.terminalId)
      .filter((i) => i !== null);

    const terminalStates = await TerminalStates.aggregate([
      { $match: { terminalId: { $in: terminal } } },
    ]);

    console.log("terminalStates:", terminalStates)

    const ser = [];
    const items = terminals.map(async (terminal: any, index) => {
      if (terminal.terminalModel) {
        await setTimeout(() => { }, 5000);

        const state = terminalStates.find((i: any) => i.terminalId === terminal?.terminalId);
        // const transactionDate = state?.lastTransactionTIme ? (new Date().getTime() - new Date(state.lastTransaction).getTime()) : 0;
        const transServ = new TransactionServices();
        let lastTransactionAmount = terminal?.terminalId ? await transServ.checkLastTransaction(terminal?.terminalId) : ""
        const type = terminal?.terminalModel.split(" ")[0];
        const model = terminal?.terminalModel.split(" ")[1];


        const PTSPFeetoday = lastTransactionAmount ? 0.0005 * (parseFloat(lastTransactionAmount) * 0.01) : 0;
        const TMOfeetoday = lastTransactionAmount ? 0.0005 * (parseFloat(lastTransactionAmount) * 0.01) : 0;

        const bank = terminal?.terminalId ? Utils.bankfromTID(terminal?.terminalId) : ""

        terminal.type = type;
        terminal.model = model;
        // state.serialNumber = undefined;
        ser.push({ ...terminal.toObject(), type, model, bank, lastTransactionAmount, PTSPFeetoday, TMOfeetoday, })


      }
    });
    const resolved = await Promise.all(items)

    return ser;
  }

  public async getActiveAndInactiveSummaryByMerchantCodeandWalletId(
    merchantCode: string,
    walletId: string = null,
    summary = false
  ) {
    const params = walletId;
    console.log(1, merchantCode, walletId)

    const terminalObjs = await TerminalConfig.find({ merchantCode: merchantCode });

    // const terminalObjs = await this.getAllTerminalsByMerchantCode(
    //   merchantCode,
    //   params
    // );

    console.log(1, terminalObjs.length)

    if (terminalObjs.length !== 0) {
      let active = [];
      let inactive = [];

      let terminals = terminalObjs
        .map((i: any) => i.terminalId)
        .filter((i) => i !== null);


      const terminalStates = await TerminalStates.aggregate([
        { $match: { terminalId: { $in: terminals } } },
      ]);

      terminalStates.map((i: any) => {
        // console.log(i.lastTransactionTime)

        if (
          moment().diff(i.lastTransactionTime, "days") >= 7 ||
          i.lastTransactionTime === undefined
        ) {
          inactive.push(i);
        } else {
          active.push(i);
        }
      });

      // console.log(inactive.length)
      // console.log(active.length)

      // console.log({
      //     totalactive: active.length,
      //     totalinactive: inactive.length,
      //     count: terminalObjs.length
      // })

      const inactiveLength = terminalStates.length === 0 ? terminalObjs.length : inactive.length;

      if (summary)
        return {
          totalactive: active.length,
          totalinactive: inactiveLength,
          count: terminalObjs.length,
        };

      return { active, inactive, count: terminalObjs.length };
    }

    return false;
  }

  public async getTerminalBySerialNumberandWalletId(
    serialNumber: string,
    walletId: string = null
  ) {
    const query =
      walletId !== null ? { serialNumber, walletId } : { serialNumber };

    return await TerminalConfig.findOne(query);
  }

  public async getTerminalBySerialNumberandMerchantCode(
    serialNumber: string,
    merchantCode: string = null
  ) {
    const query =
      merchantCode !== null ? { serialNumber, merchantCode } : { serialNumber };

    return await TerminalConfig.findOne(query);
  }

  public async getHostConfigByHostName(hostname: string) {
    return await HostConfig.findOne(
      { hostname },
      "-_id -_v -nibssip -nibssport_plain -nibssport_ssl"
    );
  }

  public async getTerminalBySerialNumber(serialNumber: string) {
    return await TerminalConfig.findOne({ serialNumber });
  }

  public async getTerminalByTerminalId(terminalId: string) {
    return await TerminalConfig.findOne({ terminalId });
  }

  public async validateTerminalBySerialNumber(
    serialNumber: string,
    terminalId: string
  ) {
    return (
      (await TerminalConfig.findOne(
        { serialNumber, terminalId },
        "-_id -_v"
      )) ||
      (await TerminalConfig.findOne({ terminalId }, "-_id -_v")) ||
      (await TerminalConfig.findOne({ serialNumber }, "-_id -_v"))
    );
  }

  public async assignTerminalSingle(
    data: any,
    merchantCode: string = null,
    format: string = "single"
  ) {
    try {
      if (format == "single") {
        const terminalSerialChecker = await this.validateTerminalBySerialNumber(
          data.serialNumber,
          data.terminalId
        );

        // console.log(terminalSerialChecker);

        if (terminalSerialChecker !== null) return false;
      }

      if (merchantCode != null) {
        data.merchantCode = merchantCode;
      }

      // console.log(data);

      data.enabled =
        typeof data.enabled === "string" &&
          data.enabled.toLowerCase() === "true"
          ? true
          : false;
      data.defaultLogo =
        typeof data.defaultLogo === "string" &&
          data.defaultLogo.toLowerCase() === "true"
          ? true
          : false;
      data.canDoAgencyBanking =
        typeof data.canDoAgencyBanking === "string" &&
          data.canDoAgencyBanking.toLowerCase() === "true"
          ? true
          : false;
      data.canDoPurchase =
        typeof data.canDoPurchase === "string" &&
          data.canDoPurchase.toLowerCase() === "true"
          ? true
          : false;

      const createdRecord = await TerminalConfig.create(data);

      return createdRecord;
    } catch (err) {
      return false;
    }
  }

  public async assignTerminalBulk(data: any[], merchantCode: string = null) {
    const failed = [];
    const successful = [];


    for (const upload of data) {
      const terminalSerialChecker = await this.validateTerminalBySerialNumber(
        upload.serialNumber,
        upload.terminalId
      );

      if (terminalSerialChecker) {
        console.log("here");

        failed.push(upload);
      } else {
        await this.assignTerminalSingle(upload, merchantCode);

        successful.push(upload);
      }
    }

    return { failed, successful };
  }

  public async updateTerminalSingle(data: any, params: any, query: any) {
    // "editor.experimental.stickyScroll.enabled": true,
    console.log('data', data, 'params', params)
    const { serialNumber } = params;

    const findTerminal = await TerminalConfig.findOne({
      serialNumber,
    });

    if (!findTerminal)
      throw new Error(
        "Terminal does not exists or is not assigned to this merchant"
      );

    return new Promise((resolve, reject) => {
      if (data.terminalId) {
        TerminalConfig.updateOne(
          { terminalId: data.terminalId },
          { terminalId: null, reasonNoTID: data.reasonNoTID }
        )
          .then((data) => resolve(data))
          .catch((err) => resolve(false));
      }

      TerminalConfig.updateOne({ serialNumber }, data)
        .then((data) => resolve(data))
        .catch((err) => resolve(false));
    });

  }

  public async updateTerminalIdBySerialNumber(serialNumber, terminalId) {
    try {
      return await TerminalConfig.updateOne({ serialNumber }, { terminalId });
    } catch (error) {
      return false;
    }
  }

  public async updateTerminalSingleWithWalletId(
    serialNumbers: string[],
    walletId: string
  ) {
    try {
      for (let serial of serialNumbers) {
        await TerminalConfig.updateOne({ serialNumber: serial }, { walletId });
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  public async deleteTerminal(serialNumber: string) {
    return new Promise((resolve, reject) => {
      TerminalConfig.findOneAndDelete({ serialNumber })
        .then((data) => {
          console.log("Delete Feadback: ", data);

          resolve(data);
        })
        .catch((err) => {
          resolve(false);
        });
    });
  }

  public async enableordisableTerminal(serialNumber: string, action: string) {
    const enabled = action === "enable" ? true : false;

    return new Promise((resolve, reject) => {
      TerminalConfig.findOne(
        { serialNumber },
        {
          $set: {
            enabled,
          },
        }
      )
        .then((doc) => {
          console.log("Latest document update Log on terminal", doc);

          resolve(doc);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  public async getHealthCheckPatternForTerminals(
    merchantcode: string,
    filter: any,
    walletId: string = null
  ) {
    let merchantterminals = await this.getAllTerminalsByMerchantCode(
      merchantcode,
      walletId
    );

    // console.log(merchantDetails.terminals);

    if (!merchantterminals) return {};

    merchantterminals = Utils.convertTermninalsArrayObject(merchantterminals);

    let match = Utils.setRange({}, filter);

    let terminalStates = await TerminalStates.aggregate([
      { $match: { terminalId: { $in: [...merchantterminals] } } },
      {
        $group: {
          _id: { terminalId: "$terminalId" },
          stateInformation: { $last: "$stateInformation" },
        },
      },
      {
        $project: {
          _id: 0,
          terminalId: "$_id.terminalId",
          stateInformation: "$stateInformation",
        },
      },
    ])
      .allowDiskUse(true)
      .read("secondary");

    //   console.log(terminalStates);

    let response = terminalStates.map((terminal) => {
      let { stateInformation } = terminal;

      try {
        stateInformation = JSON.parse(stateInformation);
      } catch (error) {
        stateInformation = { tid: terminal.terminalId };
      }

      return {
        terminalId: stateInformation.tid,
        state: {
          type: stateInformation.tmanu,
          model: stateInformation.tmn,
          network: stateInformation.coms,
          signal: stateInformation.ss,
          chargingStatus: stateInformation.cs,
          hasBattery: stateInformation.hb == "true" ? "Yes" : "No",
          printerStatus: stateInformation.ps,
          batteryLevel: stateInformation.bl,
          lastConnectDate: stateInformation.ctime,
          softwareVersion: stateInformation.sv,
        },
      };
    });

    return response;
  }

  public async getTerminalLocationPatternTerminals(filter: any) {
    let terminals = [];

    // console.log(filter);

    let merchantcode = filter.merchantcode;
    if (merchantcode) {
      let merchantterminals = await this.getAllTerminalsByMerchantCode(
        merchantcode
      );

      // console.log(merchantDetails.terminals);

      if (!merchantterminals) return [];

      merchantterminals = Utils.convertTermninalsArrayObject(merchantterminals);

      if (merchantterminals) {
        terminals = merchantterminals;
      }
    } else if (filter.terminal) terminals.push(filter.terminal);

    // console.log("terminals "+JSON.stringify(terminals))

    if (terminals.length <= 0) return [];

    let terminalStates = await TerminalStates.aggregate([
      { $match: { terminalId: { $in: [...terminals] } } },
      {
        $group: {
          _id: { terminalId: "$terminalId" },
          stateInformation: { $last: "$stateInformation" },
        },
      },
      {
        $project: {
          _id: 0,
          terminalId: "$_id.terminalId",
          stateInformation: "$stateInformation",
        },
      },
    ])
      .allowDiskUse(true)
      .read("secondary");

    // console.log(terminalStates);

    let response = terminalStates.map((terminal) => {
      let { stateInformation } = terminal;
      let cellInfo = null;

      try {
        stateInformation = JSON.parse(stateInformation);
        if (stateInformation.cloc) {
          cellInfo = stateInformation.cloc;
        }
      } catch (error) { }

      return {
        terminalId: stateInformation.tid,
        location: cellInfo,
      };
    });

    return response;
  }

  public async getActiveInactiveCountReports(filter: any) {
    let match = Utils.setRange({}, filter);

    // let terminals = await MerchantSummary.aggregate([
    //     {$match : match },
    //     {$group : {_id : "$terminalId"}},
    //     {$count : 'count'}
    // ]).allowDiskUse(true).read("secondary");

    let terminals = await StateDataModel.aggregate([
      { $match: { lTxnAt: match.createdAt } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: "$tid",
          merchantId: { $last: "$mid" },
          lastSeen: { $last: "$lTxnAt" },
        },
      },
      // {$project : {_id : 0, merchantId : "$merchantId", terminals : "$_id",lastSeen : "$lastSeen"}},
      { $count: "count" },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let totalTerminals = await TerminalKeys.aggregate([
      { $group: { _id: "$terminalId" } },
      { $count: "count" },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let data = { active: 0 };
    if (terminals && terminals.length) data.active = terminals[0].count;

    data["inactive"] = totalTerminals[0].count - data.active;

    data["totalTerminals"] = totalTerminals[0].count;

    return data;
  }

  public async getActiveInactiveVolumeReports(filter: any) {
    let match = Utils.setRange({}, filter, filter.type == "inactive");

    filter = Utils.setPaging(filter);

    let terminals = await StateDataModel.aggregate([
      { $match: { lTxnAt: match.createdAt } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: "$tid",
          merchantId: { $last: "$mid" },
          lastSeen: { $last: "$lTxnAt" },
          mrD: { $last: "$merchantData" },
        },
      },
      {
        $project: {
          _id: 0,
          merchantId: "$merchantId",
          terminals: "$_id",
          lastSeen: "$lastSeen",
          merchantData: "$mrd",
        },
      },
      { $skip: filter.skip },
      { $limit: filter.pageSize },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let terminalsCount = await StateDataModel.aggregate([
      { $match: { lTxnAt: match.createdAt } },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: "$tid",
          merchantId: { $last: "$mid" },
          lastSeen: { $last: "$lTxnAt" },
        },
      },
      // {$project : {_id : 0, merchantId : "$merchantId", terminals : "$_id",lastSeen : "$lastSeen"}},
      { $count: "count" },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let merchantList = terminals.map((v) => {
      return v.merchantId;
    });

    let merchantInfo = await MerchantModel.aggregate([
      { $match: { merchant_id: { $in: merchantList } } },
    ])
      .allowDiskUse(true)
      .read("secondary");
    // let merchantInfo = [];

    let data = terminals.map((tid) => {
      let mInfo = merchantInfo.find((c) => c.merchant_id == tid.merchantId);
      if (mInfo) {
        tid.merchantData = {
          merchant_name: mInfo.merchant_name,
          merchant_phone: mInfo.merchant_phone,
          merchant_email: mInfo.merchant_email,
          merchant_contact: mInfo.merchant_contact,
          merchant_address: mInfo.merchant_address,
        };
      }
      return tid;
    });

    return {
      terminals: data,
      count: terminalsCount[0].count,
    };
  }

  public async getlast2DaysActiveTerminalsReport(filter: any) {
    let days = Number(filter.days) || 1;
    console.log(days);
    let start = null;
    let end = null;

    if (days <= 2) {
      start = moment()
        .tz("Africa/Lagos")
        .subtract(days, "day")
        .startOf("day")
        .toDate();
      end = moment()
        .tz("Africa/Lagos")
        .subtract(days, "day")
        .endOf("day")
        .toDate();
    } else {
      start = moment("1970-01-01").tz("Africa/Lagos").endOf("day").toDate();
      end = moment()
        .tz("Africa/Lagos")
        .subtract(days, "day")
        .endOf("day")
        .toDate();
    }

    filter = Utils.setPaging(filter);

    let terminals = await StateDataModel.aggregate([
      {
        $match: {
          lTxnAt: {
            $gt: start,
            $lte: end,
          },
        },
      },
      { $group: { _id: "$tid", lastSeen: { $last: "$lTxnAt" } } },
      { $project: { _id: 0, terminalId: "$_id", lastSeen: "$lastSeen" } },
      { $skip: filter.skip },
      { $limit: filter.pageSize },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let terminalsCount = await StateDataModel.aggregate([
      {
        $match: {
          lTxnAt: {
            $gt: start,
            $lte: end,
          },
        },
      },
      { $group: { _id: "$tid" } },
      { $count: "count" },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let data = await this.appendMerchantInfo(terminals);

    return {
      terminals: data,
      count: terminalsCount[0].count,
    };
  }

  public async getlast2DaysActiveTerminals(filter: any) {
    let days = Number(filter.days) || 1;
    console.log(days);
    let start = null;
    let end = null;

    if (days <= 2) {
      start = moment()
        .tz("Africa/Lagos")
        .subtract(days, "day")
        .startOf("day")
        .toDate();
      end = moment()
        .tz("Africa/Lagos")
        .subtract(days, "day")
        .endOf("day")
        .toDate();
    } else {
      start = moment("1970-01-01").tz("Africa/Lagos").endOf("day").toDate();
      end = moment()
        .tz("Africa/Lagos")
        .subtract(days, "day")
        .endOf("day")
        .toDate();
    }

    let terminals = await StateDataModel.aggregate([
      {
        $match: {
          lTxnAt: {
            $gt: start,
            $lte: end,
          },
        },
      },
      { $group: { _id: "$tid", lastSeen: { $last: "$lTxnAt" } } },
      // {$project : {_id : 0,terminalId : "$_id",state : "$state"}}
      { $count: "count" },
    ])
      .allowDiskUse(true)
      .read("secondary");

    // .log(terminals);

    let data = { active: 0 };
    if (terminals && terminals.length) data.active = terminals[0].count;

    return data;
  }

  // public async getInactiveStatisticsReports() {
  //     throw new Error('Method not implemented.');

  // }

  public async getPrinterStatusCount(filter: any) {
    let match = {};

    if (filter.status == "good")
      match["ps"] = { $in: ["Printer OK", "PrinterAvailable", "PrinterOK"] };
    else if (filter.status == "bad")
      match["ps"] = { $nin: ["Printer OK", "PrinterAvailable", "PrinterOK"] };

    match = Utils.setRange(match, filter);

    let terminals = await StateDataModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { terminalId: "$tid" },
          stateInformation: { $last: "$ps" },
        },
      },
      // { $project: { _id: 0, terminalId: '$_id.terminalId', stateInformation: '$stateInformation' } },
      { $count: "count" },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let data = { count: 0 };
    if (terminals && terminals.length) data.count = terminals[0].count;

    return data;
  }

  public async getPrinterStatusReports(filter: any) {
    let match = {};

    if (filter.status == "good")
      match["ps"] = { $in: ["Printer OK", "PrinterAvailable", "PrinterOK"] };
    else if (filter.status == "bad")
      match["ps"] = { $nin: ["Printer OK", "PrinterAvailable", "PrinterOK"] };

    match = Utils.setRange(match, filter);

    filter = Utils.setPaging(filter);

    let terminals = await StateDataModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { terminalId: "$tid" },
          stateInformation: { $last: "$ps" },
        },
      },
      {
        $project: {
          _id: 0,
          terminalId: "$_id.terminalId",
          stateInformation: "$stateInformation",
        },
      },
      { $skip: filter.skip },
      { $limit: filter.pageSize },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let terminalsCount = await StateDataModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { terminalId: "$tid" },
          stateInformation: { $last: "$ps" },
        },
      },
      // { $project: { _id: 0, terminalId: '$_id.terminalId',stateInformation: "$stateInformation" }},
      { $count: "count" },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let data = await this.appendMerchantInfo(terminals);

    return {
      terminals: data,
      count: terminalsCount[0].count,
    };
  }

  public async getSignalStatusCount(filter: any) {
    let match: any = {};

    let level = filter.level;
    let ranges = level.split("-");
    if (ranges.length < 2) return { count: 0 };
    let start = Number(ranges[0]);
    let end = Number(ranges[1]);

    match = Utils.setRange(match, filter);

    let terminals = await StateDataModel.aggregate([
      {
        $match: { ss: { $gte: start, $lte: end }, createdAt: match.createdAt },
      },
      {
        $group: {
          _id: { terminalId: "$tid" },
          stateInformation: { $last: "$ss" },
        },
      },
      // { $project: { _id: 0, terminalId: '$_id.terminalId', stateInformation: '$stateInformation' } },
      { $count: "count" },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let data = { count: 0 };

    if (terminals && terminals.length) data.count = terminals[0].count;

    return data;
  }

  public async getSignalStatusReport(filter: any) {
    let match: any = {};

    let level = filter.level;
    let ranges = level.split("-");
    if (ranges.length < 2) return { count: 0 };
    let start = Number(ranges[0]);
    let end = Number(ranges[1]);

    match = Utils.setRange(match, filter);
    filter = Utils.setPaging(filter);

    let terminals = await StateDataModel.aggregate([
      {
        $match: { ss: { $gte: start, $lte: end }, createdAt: match.createdAt },
      },
      {
        $group: {
          _id: { terminalId: "$tid" },
          stateInformation: { $last: "$ss" },
        },
      },
      {
        $project: {
          _id: 0,
          terminalId: "$_id.terminalId",
          stateInformation: "$stateInformation",
        },
      },
      { $skip: filter.skip },
      { $limit: filter.pageSize },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let terminalsCount = await StateDataModel.aggregate([
      {
        $match: { ss: { $gte: start, $lte: end }, createdAt: match.createdAt },
      },
      {
        $group: {
          _id: { terminalId: "$tid" },
          stateInformation: { $last: "$ss" },
        },
      },
      // { $project: { _id: 0, terminalId: '$_id.terminalId' } },
      { $count: "count" },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let data = await this.appendMerchantInfo(terminals);

    return {
      terminals: data,
      count: terminalsCount[0].count,
    };
  }

  public async getBatteryLevelCount(filter: any) {
    let match: any = {};

    let level = filter.level;
    let ranges = level.split("-");
    if (ranges.length < 2) return { count: 0 };
    let start = Number(ranges[0]);
    let end = Number(ranges[1]);

    match = Utils.setRange(match, filter);

    let terminals = await StateDataModel.aggregate([
      {
        $match: { bl: { $gte: start, $lte: end }, createdAt: match.createdAt },
      },
      {
        $group: {
          _id: { terminalId: "$tid" },
          stateInformation: { $last: "$bl" },
        },
      },
      // { $project: { _id: 0, terminalId: '$_id.terminalId', stateInformation: '$stateInformation' } },
      { $count: "count" },
    ])
      .allowDiskUse(true)
      .read("secondary");

    console.log(1, terminals);

    let data = { count: 0 };

    if (terminals && terminals.length) data.count = terminals[0].count;

    return data;
  }

  public async getBatteryLevelReport(filter: any) {
    let match: any = {};

    let level = filter.level;
    let ranges = level.split("-");
    if (ranges.length < 2) return { count: 0 };
    let start = Number(ranges[0]);
    let end = Number(ranges[1]);

    match = Utils.setRange(match, filter);

    filter = Utils.setPaging(filter);

    let terminals = await StateDataModel.aggregate([
      {
        $match: { bl: { $gte: start, $lte: end }, createdAt: match.createdAt },
      },
      {
        $group: {
          _id: { terminalId: "$tid" },
          stateInformation: { $last: "$bl" },
        },
      },
      {
        $project: {
          _id: 0,
          terminalId: "$_id.terminalId",
          stateInformation: "$stateInformation",
        },
      },
      { $skip: filter.skip },
      { $limit: filter.pageSize },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let terminalsCount = await StateDataModel.aggregate([
      {
        $match: { bl: { $gte: start, $lte: end }, createdAt: match.createdAt },
      },
      {
        $group: {
          _id: { terminalId: "$tid" },
          stateInformation: { $last: "$bl" },
        },
      },
      // { $project: { _id: 0, terminalId: '$_id.terminalId' } },
      { $count: "count" },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let data = await this.appendMerchantInfo(terminals);

    return {
      terminals: data,
      count: terminalsCount[0].count,
    };
  }

  public async getTerminalsStates(filter: any) {
    filter = Utils.setPaging(filter);
    let match: any = { $match: {} };
    if (filter.terminal) {
      match.$match.tid = filter.terminal;
    }

    if (filter.merchant) {
      match.$match.mid = filter.merchant;
    }

    let aggr = [match].concat(Mapper.terminalStatQuery(), [
      { $skip: filter.skip },
      { $limit: filter.pageSize },
    ]);

    let terminals = await this.GetTerminalStats(aggr);
    return terminals;
  }

  /**
   * terminals stats
   */

  // public async generateTerminalStats(){
  //     let terminals = await  this.GetTerminalStats(Mapper.terminalStatQuery(),true);
  //     let file  = await Utils.generateForTerminalState(terminals);
  //     if(file  == false){
  //         console.error(`enable to generate terminal state report at ${new Date()}`);
  //         return;
  //     }
  //     EmailService.SendTerminalStatReport([file]).then((info)=>{
  //         console.log(`terminal states report sent`);
  //         console.log(JSON.stringify(info));
  //     }).catch(err=>{
  //         console.error(`error sending terminal state report, ${err}`);
  //     })
  // }

  public async GetTerminalStats(match: any[], report = false) {
    // console.log(match)
    let terminals = await StateDataModel.aggregate(match)
      .allowDiskUse(true)
      .read("secondary");
    if (report) return terminals;
    return await this.appendMerchantInfo(terminals);
  }

  public async getArchivedTerminals(filter: any) {
    return await TerminalConfig.find({ $or: [{ terminalId: "" }, { terminalId: null }] }).sort({
      createdAt: -1,
    });
  }

  public async getTerminal(terminalId: string) {
    return await TerminalConfig.findOne({ terminalId }).select(" -_id -createdAt -updateAt")
  }

  private async appendMerchantInfo(terminals: any[]) {
    let merchantInfo = await MerchantModel.aggregate([
      {
        $match: {
          terminals: {
            $in: terminals.map((tm) => {
              return tm.terminalId;
            }),
          },
        },
      },
    ])
      .allowDiskUse(true)
      .read("secondary");

    let data = terminals.map((tid) => {
      let mInfo = merchantInfo.find((c) =>
        c.terminals.includes(tid.terminalId)
      );
      if (mInfo) {
        tid.merchantData = {
          merchant_name: mInfo.merchant_name,
          merchant_phone: mInfo.merchant_phone,
          merchant_email: mInfo.merchant_email,
          merchant_contact: mInfo.merchant_contact,
          merchant_address: mInfo.merchant_address,
        };
        tid.merchantId = mInfo.merchant_id;
      }
      return tid;
    });

    return data;
  }
  public async createRemoteUpdate(body: IUpdate) {

    const new_update = new UpdateModel(body)
    await new_update.save()

    return new_update

  }
  public async getTerminalSoftwareList() {
    return await UpdateModel.find({}).sort({ createdAt: -1 })
  }
  public async checkTerminalUpdateAvailability(params: any) {

    const { brand, model, current_version, serial_number } = params
    const findUpdate: any = await UpdateModel.find({ $and: [{ model: model }, { brand: brand }] }).sort({ createdAt: -1 })
    if (findUpdate.length > 0) {
      const available_terminals = JSON.parse(findUpdate[0].terminals).map((terminal: string) => { return terminal.trim() })
      // console.log(JSON.parse(findUpdate[0].terminals), available_terminals, current_version != findUpdate[0].version && available_terminals.includes(serial_number))
      if (current_version != findUpdate[0].version && available_terminals.includes(serial_number)) {
        return {
          'message': 'new update found with serial number',
          'version': findUpdate[0].version,
          'brand': findUpdate[0].brand,
          'model': findUpdate[0].model,
          'serial_number': serial_number,
          'host': process.env.HOSTIP,
          'port': process.env.PORT,
          'download_link': findUpdate[0].path
        }
      } else {
        return {
          'message': 'no new update found with serial number',
          'version': findUpdate[0].version,
          'brand': findUpdate[0].brand,
          'model': findUpdate[0].model,
          'serial_number': serial_number,
          'download_link': ""
        }
      }
    } else {
      return {
        'message': `no update available for the ${brand}, ${model}`,
      }

    }
  }
  public async downloadUpdate(file: any, response) {
    try {
      const update = path.join(__dirname + `/../../uploads/software_updates/${file}`).replace(/\\/g, '/')
      response.download(update)
    } catch (error) {
      response.header("Content-Type", 'application/json').status(500).send({});

    }
  }
  /**
    * Gets the count of all terminals
    */
  async getAllCount(merchant_id = null, search = null) {
    const filter = merchant_id ? { merchant_id } : {};
    if (search) {
      const $or = [];
      filter['$or'] = [
        { merchant_id: { $regex: Utils.getRegExp(search) } },
        { terminal_id: { $regex: getRegExp(search) } },
        { serial_no: { $regex: getRegExp(search) } },
        { assigned_phone: { $regex: getRegExp(search) } },
      ];
    }
    const count = await TerminalConfig.countDocuments({ ...this.match, ...filter });
    return count;
  }


  /**
 * Gets trminal statistics for given merchant ID
 * @param {Array} merchantIds
 */
  async getMerchantsTerminalStats(merchantIds) {
    const stats = await TerminalConfig.aggregate([
      { $match: { ...this.match, merchant_id: { $in: merchantIds } } },
      { $group: { _id: '$merchant_id', terminals_count: { $sum: 1 } } },
      { $project: { merchant_id: '$_id', terminals_count: 1 } },
    ]);

    return stats;
  }

  /**
   * This gets all terminals for given filter
   * @param {Number} page
   * @param {Number} limit
   * @param {String} search
   * @returns {Array} terminals
   */
   async getTerminals(page = 1, limit = 30, merchant, search = null, tIDs = []) {
    const offset = (page - 1) * limit;

    const filter = { ...this.match };
    if (merchant) filter.merchant_id = merchant;
    if (tIDs.length) {
      filter.terminal_id = { $in: tIDs };
    } else if (search) {
      filter.$or = [
        { merchant_id: { $regex: getRegExp(search) } },
        { terminal_id: { $regex: getRegExp(search) } },
        { serial_no: { $regex: getRegExp(search) } },
        { assigned_phone: { $regex: getRegExp(search) } },
      ];
    }

    const $project = {
      terminal_id: 1,
      assigned_phone: 1,
      software_version: 1,
      serial_no: 1,
      address_line_one: 1,
      installed_date: 1,
      last_connect_date: 1,
      merchant_id: 1,
      type: 1,
      model: 1,
      network: 1,
      signal: 1,
      charging_status: 1,
      printer_status: 1,
      battery_level: 1,
      geo_address: 1,
      lat: 1,
      lon: 1,
      active: 1,
    };

    let terminals = await TerminalConfig.aggregate([
      { $match: filter },
      { $sort: { lon: -1 } },
      { $skip: offset },
      { $limit: limit },
      // { $project },
    ]);
    
    const activeTime = 50*1000;

    const data = terminals.map((item) => {
      item.active = new Date().getTime() - new Date(item.last_connect_date).getTime() < activeTime * 1000;
      return item;
    });

    return { rows: data };
  }


  /**
   * Creates new terminals given single or array of terminals
   * @param {*} data - Array or Objct
   */
   async create(data) {
    const isSingle = !Array.isArray(data);
    try {
      if (isSingle && data.terminal_id) await TerminalConfig.updateOne({ terminal_id: data.terminal_id }, data, { upsert: true });
      else await TerminalConfig.insertMany(isSingle ? [data] : data, { ordered: false, rawResult: true });
    } catch (error) {
      console.log(error.message);
    }
    if (!isSingle || !data.terminal_id) return true;

    const record = await this.getTerminal(data.terminal_id);
    return record;
  }



  async getMerchantTIDs(merchant_id, onlyID = true) {
    const merchIDs = Array.isArray(merchant_id) ? merchant_id : [merchant_id];
    let terminals:any = await TerminalConfig.find({ ...this.match, merchantId: { $in: merchIDs } }).select('terminalId');
    if (onlyID) return terminals.map(item => item.terminal_id);
    return terminals;
  }

  async termMaps() {
    const data = await TerminalConfig.find({ lon: { $ne: null }, ...this.match }).select('terminal_id lon lat geo_address');
    return data;
  }


  async getQueryTotalForDownload() {
    let total = await TerminalConfig.aggregate([
      { $match: this.match },
      {
        $group: {
          _id: 0,
          count: { $sum: 1 }
        }
      }
    ]);
    const count = total[0].count;
    console.log("count :", count)

    if (count > 0) {
      let filename = await generateFilenameTerminal();
      process.env.gen_files = (process.env.gen_files || "") + filename + ","

      return { total: count, filename: filename }
    }
    return false;
  }

  async generateReportTlm(total = 0, filename = "") {
    let filePath = `files/${filename}`;
    let workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ filename: filePath, useStyles: true, useSharedStrings: true });
    workbook.creator = "Bizzdesk System";

    let workSheet:any = workbook.addWorksheet("Terminal Export");
    workSheet.columns = getTerminalHeaders();
    console.log("total", total)
    let pages = Math.ceil((total + 5000) / 5000);

    let index = 0;

    try {
      while (index != pages) {
        let txn = await TerminalConfig.aggregate([
          { $match: this.match },
          { $skip: index * 5000 },
          { $limit: 5000 },
        ]);
        // find({}).skip(index * 5000).limit(5000);
        console.log("index " + index + " pages : " + pages);
        if (txn.length) {
          txn.map(t => {
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

  groupingTerminal(){
    
  }

}


export default new TerminalServices();
