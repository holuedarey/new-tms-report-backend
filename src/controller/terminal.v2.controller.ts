import { Request, Response } from 'express';
import terminalServices from '../services/terminal.services';
import ApiResponse from '../helpers/apiResponse';
import { apiStatusCodes } from '../helpers/constants';
import TransactionService from '../services/transaction.services';
import terminalConfigsModel from '../db/model/terminalConfigs.model';
import { validateMongoID } from '../helpers/util';
import Merchant from '../db/model/merchant.model';

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

            ApiResponse.send(res, apiStatusCodes.success, '',{
                data,
            });
        } catch (error) {
            ApiResponse.error(res,apiStatusCodes.serverError,error, null);
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

            ApiResponse.send(res, apiStatusCodes.success, '',{
                data: { itemCount },
            });
        } catch (error) {
            ApiResponse.error(res,apiStatusCodes.serverError,error, null);
        }
    }

    /**
     * This handles getting all terminals.
     * @param {express.Request} req Express request param
     * @param {express.Response} res Express response param
     */
    async getAll(req: Request, res: Response) {
        const { page, limit, merchant, terminals: tids } = req.query;
        const limits = Number.isNaN(parseInt(req.query.limit as string, 10)) ? 30 : parseInt(limit as string , 10);
        const pages = Number.isNaN(parseInt(req.query.page as string, 10)) ? 1 : parseInt(page as string , 10);

        try {
            const terminals = await terminalServices.getTerminals(
                pages,
                limits,
                merchant,
                req.query.search
            );
            ApiResponse.send(res, apiStatusCodes.success,'', {
                data: terminals.rows,
            });
        } catch (error) {
            ApiResponse.error(res,apiStatusCodes.serverError,error, null);
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
      ApiResponse.error(res,apiStatusCodes.serverError,error, null);
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

      ApiResponse.send(res, apiStatusCodes.success, '',{
        message: "Terminals added successfully.",
      });
    } catch (error) {
      ApiResponse.error(res,apiStatusCodes.serverError,error, null);
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
      return ApiResponse.send(res, apiStatusCodes.notFound, '',{
        error: "Terminal not found from inventory",
      });
    }

    try {
      const terminal = await terminalConfigsModel.findById(id) as any;
      if (!terminal) {
        return ApiResponse.send(res, apiStatusCodes.notFound, '',{
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

      return ApiResponse.send(res, apiStatusCodes.success, '',{
        message: "Terminal ID has been successfully assigned to terminal",
      });
    } catch (error) {
      ApiResponse.error(res,apiStatusCodes.serverError,error, null);
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

      ApiResponse.send(res, apiStatusCodes.success, '',{
        data: terminals,
      });
    } catch (error) {
      ApiResponse.error(res,apiStatusCodes.serverError,error, null);
    }
  }


}


export default new TerminalV2Controller();