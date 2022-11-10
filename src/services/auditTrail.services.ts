

// import { checkNumber, getRegExp } from '../helpers/utils';
import moment from 'moment';
import  mongoose  from 'mongoose';
import Utils from '../helpers/utils';
import Audit from '../db/model/audit.model';

/**
 * @class Auth Service
 * Handle queries and processes data related to Audit Model
 */
class AuditTrailService {
    public $match;
    public $limit;
    public $skip;
    public Audit;

  constructor() {
    this.Audit = Audit;
    this.$match = {};
    this.$limit = 50;
    this.$skip = 0;
  }

  setIDs(ids) {
    if (ids) {
      if (!Array.isArray(ids)) ids = [ids];
      ids = ids.map(id => mongoose.Types.ObjectId(id));
      this.$match._id = { $in: ids };
    }
    return this;
  }

  setRoles(role) {
    if (role) {
      this.$match['user.role'] = role;
    }
    return this;
  }

  setDate(start, end, range = 'd') {
    if (start) {
      range = range == 'm' ? 'month' : range;
      this.$match['createdAt'] = {
        $gte: moment(start, 'YYYY-MM-DD')
          .tz(process.env.TZ)
          .startOf('d').toDate(),
        $lte: moment(end || start, 'YYYY-MM-DD')
          .tz(process.env.TZ)
          .endOf('d').toDate(),
      };
    }
    return this;
  }


  setLimit(limit) {
    if (Utils.checkNumber(limit)) this.$limit = parseInt(limit, 10);
    return this;
  }

  setPage(page) {
    if (page) {
      const pageNo = Utils.checkNumber(page) ? parseInt(page, 10) : 1;
      this.$skip = (pageNo - 1) * this.$limit;
    }
    return this;
  }


  setAudityType(type) {
    if (type) {
      this.$match.auditType = type;
    }
    return this;
  }

  setUsername(name) {
    if (name) {
      this.$match['user.name'] = name;
    }
    return this;
  }

  setUserEmail(email) {
    if (email) {
      this.$match['user.email'] = email;
    }
    return this;
  }

  setSearch(search) {
    const getSObj = (key) => {
      const obj = {};
      obj[key] = { $regex: Utils.getRegExp(search) };
      return obj;
    };
    if (search) {
      const $or = [];
      $or.push(getSObj('auditActivity'));
      $or.push(getSObj('auditType'));
      $or.push(getSObj('disputeId'));
      $or.push(getSObj('description'));
      $or.push(getSObj(`user.name`));
      $or.push(getSObj(`user.role`));
      $or.push(getSObj(`user.email`));
      // if (checkNumber(search)) $or.push(getSObj(transMod.getField('amount')));
      this.$match.$or = $or;
    }
    return this;
  }
  /**
   * Create Operation for an Audit trail
   * @param {String} auditActivity
   * @param {String} auditType
   * @param {Object} user
   * @param {String} description
   * @returns {Object}
   */
  async createAuditOperation(payload) {
   
      const auditTrail = new Audit(payload);
      await auditTrail.save();
      return auditTrail;
  }

  /**
   * Update Operation for an Audit trail
   * @param {String} auditActivity
   * @param {String} auditType
   * @param {Object} user
   * @param {String} description
   * @returns {Object}
   */
   async updateAuditOperation(payload) {
    if (!payload.name || !payload.email || !payload.auditActivity) {
     
    }

    else{
      //let roles = `${role || ''}`.toLowerCase().split(' ') || [];
      const userDetails = {name: payload.name, email: payload.email, role: payload.role}
      if(payload.role){
        userDetails.role = payload.role;
      }
      const auditTrail = new Audit({ 
        auditActivity: payload.auditActivity, 
        description: payload.description, 
        ipAddress: payload.ipAddress,
        auditType: "Update",
        disputeId: payload.disputeId,
        user : userDetails
      });
      auditTrail.save();

      console.log("Update Operation performed with id ", auditTrail._id);

      return auditTrail;
    }
  }

  /**
   * Gets all Audit Trails
   * @returns {Object}
   */
   async getAudits() {
  
    const project = {
      auditActivity: 1,
      auditType: 1,
      user: 1,
      ipAddress: 1,
      description: 1,
      createdAt: 1,
      updatedAt: 1,
    };

   
    let audits = await Audit.aggregate([
      { $match: this.$match },
      { $sort: { createdAt: -1 } },
      { $skip: this.$skip },
      { $limit: this.$limit },
      { $project: project },
    ]);

    return {
      rows: audits,
    };
  }
}

export default AuditTrailService;