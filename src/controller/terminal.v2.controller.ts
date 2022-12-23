import { Request, Response } from 'express';
import terminalServices from '../services/terminal.services';
import ApiResponse from '../helpers/apiResponse';
import { apiStatusCodes } from '../helpers/constants';
import TransactionService from '../services/transaction.services';
import terminalConfigsModel from '../db/model/terminalConfigs.model';
import { validateMongoID } from '../helpers/util';
import Merchant from '../db/model/merchant.model';
import TransactionServices from "../services/transaction.services";
import Utils from "../helpers/utils";

class TerminalV2Controller {

  constructor() { }

  /**
 * This handles getting dashboard statistics.
 * @param {express.Request} req Express request param
 * @param {express.Response} res Express response param
 */
  async getStats(req: Request, res: Response) {


    try {
      const tranServ = new TransactionService();
      const activeTerminals = await tranServ.transTermStat(
        "active",
      );
      const onlineTerminals = await tranServ.transTermStat(
        "online",
      );
      const allCount = await terminalServices.getAllCount();
      let inactiveTerminals = allCount - activeTerminals;
      inactiveTerminals = inactiveTerminals < 0 ? 0 : inactiveTerminals;

      const data = {
        activeTerminals,
        onlineTerminals,
        inactiveTerminals,
        allTerminals: allCount,
      };

      ApiResponse.send(res, apiStatusCodes.success, '', {
        data,
      });
    } catch (error) {
      ApiResponse.error(res, apiStatusCodes.serverError, error, null);
    }
  }

  /**
   * This handles getting terminals count.
   * @param {express.Request} req Express request param
   * @param {express.Response} res Express response param
   */
  async getCount(req: Request, res: Response) {


    try {
      const itemCount = await terminalServices.getAllCount(
        req.query.search
      );

      ApiResponse.send(res, apiStatusCodes.success, '', {
        data: { itemCount },
      });
    } catch (error) {
      ApiResponse.error(res, apiStatusCodes.serverError, error, null);
    }
  }

  /**
   * This handles getting all terminals.
   * @param {express.Request} req Express request param
   * @param {express.Response} res Express response param
   */
  async getAll(req: Request, res: Response) {
    const { page, limit, merchant, terminals: tids } = req.query;
    const limits = Number.isNaN(parseInt(req.query.limit as string, 10)) ? 30 : parseInt(limit as string, 10);
    const pages = Number.isNaN(parseInt(req.query.page as string, 10)) ? 1 : parseInt(page as string, 10);

    try {
      const terminals = await terminalServices.getTerminals(
        pages,
        limits,
        merchant,
        req.query.search
      );
      // let terminal = terminals['rows']
      // .map((i: any) => i.terminalId)
      // .filter((i) => i !== null);
      // let ser = [];
      // const items = terminals['rows'].map(async (terminal: any, index) => {
      //   if (terminal.terminalModel) {
      //     await setTimeout(() => { }, 5000);
  
      //     const transServ = new TransactionServices();
      //     let lastTransactionAmount = terminal?.terminalId ? await transServ.checkLastTransaction(terminal?.terminalId) : ""
      //     const type = terminal?.terminalModel.split(" ")[0];
      //     const model = terminal?.terminalModel.split(" ")[1];
  
  
      //     const PTSPFeetoday = lastTransactionAmount ? 0.0005 * (parseFloat(lastTransactionAmount) * 0.01) : 0;
      //     const TMOfeetoday = lastTransactionAmount ? 0.0005 * (parseFloat(lastTransactionAmount) * 0.01) : 0;
  
      //     const bank = terminal?.terminalId ? Utils.bankfromTID(terminal?.terminalId) : ""
  
      //     terminal.type = type;
      //     terminal.model = model;
      //     // state.serialNumber = undefined;
      //     ser.push({ ...terminal.toObject(), type, model, bank, lastTransactionAmount, PTSPFeetoday, TMOfeetoday, })
  
  
      //   }
      // });
      // const resolved = await Promise.all(items)
  
      ApiResponse.send(res, apiStatusCodes.success, '', {
        data: terminals.rows, count : terminals.count
      });
    } catch (error) {
      ApiResponse.error(res, apiStatusCodes.serverError, error, null);
    }
  }

  /**
   * This handles getting  terminal state.
   * @param {express.Request} req Express request param
   * @param {express.Response} res Express response param
   */
  async getState(req: Request, res: Response) {
    // let { terminalId } = req.params;

    // try {
    //     const terminals = await TerminalService.getTidState(terminalId);
    //     ApiResponse.send(res, apiStatusCodes.success, '', {
    //         data: terminals,
    //     });
    // } catch (error) {
    //      ApiResponse.error(res,apiStatusCodes.serverError,error, null);
    // }
  }


  /**
   * This handles getting transactions summary for merchants.
   * @param {express.Request} req Express request param
   * @param {express.Response} res Express response param
   */
  async statChart(req: Request, res: Response) {
    const lowBatLev = 50;
    const lowNetLev = 50;
    // const activeTime = await ConfigService.getKeyValue('active_terminal_seconds') || 7 * 24 * 60 * 60;

    try {
      let bat = await terminalConfigsModel.aggregate([
        {
          $match: {
            $and: [
              { battery_level: { $exists: true } },
              { battery_level: { $ne: "" } },
            ],
          },
        },
        {
          $group: {
            _id: 0,
            high: {
              $sum: {
                $cond: {
                  if: { $gt: [{ $toDouble: "$battery_level" }, lowBatLev] },
                  then: 1,
                  else: 0,
                },
              },
            },
            low: {
              $sum: {
                $cond: {
                  if: { $lte: [{ $toDouble: "$battery_level" }, lowBatLev] },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
        },
      ]) as any;


      let net = await terminalConfigsModel.aggregate([
        {
          $match: {
            $and: [{ signal: { $exists: true } }, { signal: { $ne: "" } }],
          },
        },
        {
          $group: {
            _id: 0,
            high: {
              $sum: {
                $cond: {
                  if: { $gt: [{ $toDouble: "$signal" }, lowNetLev] },
                  then: 1,
                  else: 0,
                },
              },
            },
            low: {
              $sum: {
                $cond: {
                  if: { $lte: [{ $toDouble: "$signal" }, lowNetLev] },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
        },
      ]) as any;


      const tranServ = new TransactionService();
      const activeTerminals = await tranServ.transTermStat("active");
      // const activeTerminals = await Terminal.countDocuments({ $expr: { $gt: [{ $toDouble: '$last_connect_date' }, lowNetLev] } });

      const allCount = await terminalServices.getAllCount();

      return ApiResponse.send(res, apiStatusCodes.success, '', {
        data: {
          battery_low: bat.low || 0,
          battery_high: bat.high || 0,
          network_low: net.low || 0,
          network_high: net.high || 0,
          terminal_active: activeTerminals,
          terminal_inactive: allCount - activeTerminals,
          low_battery_level: lowBatLev,
          low_network_level: lowNetLev,
        },
      });
    } catch (error) {
      ApiResponse.error(res, apiStatusCodes.serverError, error, null);
    }
  }

  /**
   * This handles getting all terminals.
   * @param {express.Request} req Express request param
   * @param {express.Response} res Express response param
   */
  async onBoard(req: Request, res: Response) {
    const { data } = req.body;
    const terminals = data.map((item) => {
      item.assigned = false;
      return item;
    });

    try {
      await terminalServices.create(terminals);

      ApiResponse.send(res, apiStatusCodes.success, '', {
        message: "Terminals added successfully.",
      });
    } catch (error) {
      ApiResponse.error(res, apiStatusCodes.serverError, error, null);
    }
  }

  /**
   * This handles getting all terminals.
   * @param {express.Request} req Express request param
   * @param {express.Response} res Express response param
   */
  async assignTid(req: Request, res: Response) {
    const { id, terminal_id, merchant_id } = req.body;

    if (!validateMongoID(id)) {
      return ApiResponse.send(res, apiStatusCodes.notFound, '', {
        error: "Terminal not found from inventory",
      });
    }

    try {
      const terminal = await terminalConfigsModel.findById(id) as any;
      if (!terminal) {
        return ApiResponse.send(res, apiStatusCodes.notFound, '', {
          error: "Terminal not found from inventory",
        });
      }

      terminal.terminal_id = terminal_id;
      if (merchant_id) {
        terminal.merchant_id = merchant_id;
        terminal.assigned = true;
        await Merchant.updateOne(
          { merchant_id },
          { $inc: { assigned_term_count: 1 } }
        );
      }
      terminal.save();

      return ApiResponse.send(res, apiStatusCodes.success, '', {
        message: "Terminal ID has been successfully assigned to terminal",
      });
    } catch (error) {
      ApiResponse.error(res, apiStatusCodes.serverError, error, null);
    }
  }

  /**
   * This handles getting all terminals.
   * @param {express.Request} req Express request param
   * @param {express.Response} res Express response param
   */
  async inventory(req, res) {
    try {
      const terminals = await terminalConfigsModel.find({ assigned: false });

      ApiResponse.send(res, apiStatusCodes.success, '', {
        data: terminals,
      });
    } catch (error) {
      ApiResponse.error(res, apiStatusCodes.serverError, error, null);
    }
  }

  /**
 * This handles getting all terminals.
 * @param {express.Request} req Express request param
 * @param {express.Response} res Express response param
 */
  async getMaps(req, res) {
    try {
      const data = await terminalServices.termMaps();
      ApiResponse.send(res, apiStatusCodes.success, '', data,);
    } catch (error) {
      ApiResponse.error(res, apiStatusCodes.serverError, error, null);
    }
  }


  async netBatStat(req, res) {
    let {
      page, limit, merchant,
    } = req.query;

    const { merchant_id: loggedInMerch = null } = req.user || {};
    merchant = loggedInMerch || merchant;
    const lowBatLev = 0;
    const lowNetLev = 0;

    let bat:any = await terminalConfigsModel.aggregate([
      { $match: { $and: [{ battery_level: { $exists: true } }, { battery_level: { $ne: '' } }] } },
      {
        $group: {
          _id: 0,
          high: { $sum: { $cond: { if: { $gt: [{ $toDouble: '$battery_level' }, lowBatLev] }, then: 1, else: 0 } } },
          low: { $sum: { $cond: { if: { $lte: [{ $toDouble: '$battery_level' }, lowBatLev] }, then: 1, else: 0 } } },
        },
      },
    ]);
    [bat = {}] = bat;

    let net:any = await terminalConfigsModel.aggregate([
      { $match: { $and: [{ signal: { $exists: true } }, { signal: { $ne: '' } }] } },
      {
        $group: {
          _id: 0,
          high: { $sum: { $cond: { if: { $gt: [{ $toDouble: '$signal' }, lowNetLev] }, then: 1, else: 0 } } },
          low: { $sum: { $cond: { if: { $lte: [{ $toDouble: '$signal' }, lowNetLev] }, then: 1, else: 0 } } },
        },
      },
    ]);
    [net = {}] = net;
    ApiResponse.send(res, apiStatusCodes.success, '', {data: { bat, net }},);

  }



  async printerStat(req, res) {
    let {
      page, limit, merchant,
    } = req.query;

    const { merchant_id: loggedInMerch = null } = req.user || {};
    merchant = loggedInMerch || merchant;

    const printerOkMsg = ['Printer OK', 'PrinterAvailable', 'PrinterOK'];
    const group = {
      _id: 0,
      count: { $sum: 1 },
    }
    const terminals = await terminalConfigsModel.aggregate([
      { $match: { printer_status: { $exists: true, $nin: printerOkMsg, } } },
      { $group: group },
      { $project: { inactive: `$count` } }
    ]);
    const totalTerminal = await terminalConfigsModel.aggregate([
      { $match: {} },
      { $group: group },
      { $project: { total: `$count` } }
    ]);
    const inactive = terminals[0]?.inactive || 0;
    const total = totalTerminal[0]?.total || 0;
    ApiResponse.send(res, apiStatusCodes.success, '',{ data: { inactive, total }},);

  }

  /**
  * This handles getting Terminal download.
  * @param {express.Request} req Express request param
  * @param {express.Response} res Express response param
  */
  async downloadTerminal(req, res) {
    let {
      page, limit, merchant, terminals: tids,
    } = req.query;

    const { merchant_id: loggedInMerch = null } = req.user || {};
    merchant = loggedInMerch || merchant;

    limit = Number.isNaN(parseInt(limit, 10)) ? 30 : parseInt(limit, 10);
    page = Number.isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);
    tids = (tids || '').split(',').map(item => item.trim()).filter(item => item);


    try {

      //get total count on db
      let data:any = await terminalServices.getQueryTotalForDownload();
      console.log("counting ", data)
      if (!data) {
        console.log("counting ", data)
        ApiResponse.send(res, apiStatusCodes.success, '', `"No record Found`,);

      }

      // const transactions = await transServ.download();
      const file = await terminalServices.generateReportTlm(data.total, data.filename);
      ApiResponse.send(res, apiStatusCodes.success, '', `${process.env.API_URL}/files/${file}`,);

    } catch (error) {ApiResponse.error(res, apiStatusCodes.serverError, error, null); }
  }
 /**
   * Gets the count of all merchants
   */
  async terminalGroupingReport(req, res) {
    // const filter = { $and: [this.matchApproved] };
    const search = req.params.type;
    let group = 'bank';
    if(search != null){
      group = `${search}`
    } 
    const  pipeline = [
      {
        '$project': {
          'terminalId': 1, 
          'bank': {
            '$substr': [
              '$terminalId', 0, 4
            ]
          }, 
          'merchantCode': 1, 
          'organisationName': 1
        }
      }, {
        '$group': {
          '_id': `$${[group]}`, 
          'count': {
            '$sum': 1
          }
        }
      }
    ]
    try {
    const data = await terminalConfigsModel.aggregate(pipeline);
    ApiResponse.send(res, apiStatusCodes.success, '', data,);
    } catch (error) {ApiResponse.error(res, apiStatusCodes.serverError, error, null); }
  }


}


export default new TerminalV2Controller();