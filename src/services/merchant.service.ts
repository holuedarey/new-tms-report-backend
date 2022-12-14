import Merchant from '../db/model/merchant.model';
import TerminalService from './terminal.services';
import Logger from '../helpers/logger';
// import Utils from '../helpers/utils';

import { checkNumber, generateFilename, getReportHeaders, removeFile, curDate, getRegExp, binConverter } from "../helpers/util";
import { IMerchant } from '../interfaces/db.models';

/**
 * @class Merchant Service
 * Handle queries and processes data related to Merchant Model
 */
class MerchantService {
protected matchApproved;
  constructor() {
    this.matchApproved = {
      // $or: [
      //   { approval_level: { $exists: false } },
      //   { approval_level: { $gte: 4 } },
      // ],
    };
  }

  /**
   * Creates new merchants given single or array of merchants
   * @param {Array || Object} data - Array or Object
   */
  async create(data) {
    const isSingle = !Array.isArray(data);
    try {
      if (isSingle && data.merchant_id) await Merchant.updateOne({ merchant_id: data.merchant_id }, data, { upsert: true });
      else await Merchant.insertMany(isSingle ? [data] : data, { ordered: false, rawResult: true });
    } catch (error) {
      Logger.log(error.message);
    }
    if (!isSingle || !data.terminal_id) return true;

    const record = await this.getMerchant(data[0].merchant_id);
    return record;
  }

  /**
   * This gets all merchants for given filter and count of all
   * @param {Number} page
   * @param {Number} limit
   * @param {String} search
   * @returns {Object} containing rows and count
   */
  async getMerchants(page = 1, limit, search = null, mIDs = []) {
    const offset = (page - 1) * limit;

    const filter = { $and: [this.matchApproved] };
    if (mIDs.length) {
      filter.$and.push({
        merchant_id: { $in: mIDs },
      });
      console.log(JSON.stringify(filter))
    } else if (search) {
      const searchFilter = {
        $or: [
          { merchant_id: checkNumber(search) ? Number(search) : { $regex: getRegExp(search) } },
          { merchant_name: { $regex: getRegExp(search) } },
          { merchant_email: { $regex: getRegExp(search) } },
          { merchant_phone: checkNumber(search) ? Number(search) : { $regex: getRegExp(search) } },
        ],
      };
      filter.$and.push(searchFilter);
    }

    const $project = {
      merchant_id: 1,
      merchant_name: 1,
      merchant_phone: 1,
      merchant_email: 1,
      merchant_contact: 1,
      merchant_address: 1,
      merchant_account_nr: 1,
      created_at: 1,
    };

    let merchants = await Merchant.aggregate([
      { $match: filter },

      { $sort: { created_at: -1 } },
      {
        '$lookup': {
          'from': 'users', 
          'localField': 'supportStaff', 
          'foreignField': '_id', 
          'as': 'supportStaff'
        }
      },
      { $skip: offset },
      { $limit: limit },
      // { $project },
    ]); 
    if (!merchants.length) {
      // const merchant = await this.getSyncMerch();
      // if (merchant) merchants = [merchant];
    }
    const count =  await Merchant.countDocuments() || 0;

    return {
      rows: merchants, count
    };
  }

  /**
   * Gets merchant's details for given ID
   * @param {String} merchant_id
   * @returns {Object}
   */
  async getMerchant(merchantCode) {
    let merchant:any = await Merchant.aggregate([
      { $match: {merchantCode} },
      {
        '$lookup': {
          'from': 'terminalconfigs', 
          'localField': 'merchantCode', 
          'foreignField': 'merchantCode', 
          'as': 'terminals'
        }
      },
    ]);
    return merchant;
  }

  /**
   * Gets merchants for given merchant IDs
   * @param {Array} merchantIds
   * @returns {Array}
   */
  async getMerchantsForIds(merchantIds) {
    const merchants:any = await Merchant.find({ merchant_id: { $in: merchantIds } }).lean();
    const notFound = merchantIds.filter(id => !merchants.find(a => a.merchant_id === id));
    for (const mid of notFound) {
      // const merchant = await this.getSyncMerch(mid);
      // if (merchant) merchants.push(merchant);
    }
    return merchants;
  }

  /**
   * Gets merchant for given merchantID from SQL
   * And Sync
   * @param {String} merchant_id
   * @returns {Object}
   */
  async getSyncMerch(merchant_id) {
    return merchant_id;
  }

  /**
   * Gets the count of all merchants
   */
  async getAllCount(search = null) {
    const filter = { $and: [this.matchApproved] };
    if (search) {
      const searchFilter = {
        $or: [
          { merchant_id: checkNumber(search) ? Number(search) : { $regex: getRegExp(search) } },
          { merchant_name: { $regex: getRegExp(search) } },
          { merchant_email: { $regex: getRegExp(search) } },
          { merchant_phone: checkNumber(search) ? Number(search) : { $regex: getRegExp(search) } },
        ],
      };
      filter.$and.push(searchFilter);
    }
    const count = await Merchant.countDocuments(filter);
    return count;
  }
 
}

export default new MerchantService();
