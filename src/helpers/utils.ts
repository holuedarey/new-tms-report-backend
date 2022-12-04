import 'dotenv/config';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import moment from "moment-timezone";
import crypto from "crypto";
import CryptoJS from "crypto-js";
const { validationResult } = require("express-validator");
import xlsJson from 'json2xls';
import Merchants from '../db/model/merchant.model';
import SimpleNodeLogger from 'simple-node-logger';
import Excel from 'exceljs';
import { Request } from 'express';

import { threshold, weekThreshold, dateGroup} from '../helpers/constants';

class Utils {

    public static setPage(page: string, limit: number) {
        const pageNo = this.checkNumber(page) ? parseInt(page, 10) : 1;
        return (pageNo - 1) * limit;
    }

    public static checkNumber(input: string) { return `${input}`.search(/\D/) < 0 };

    public static getRegExp = text => new RegExp(`${text}`.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');

    public static hashpassword(pwd: string) {
        const salt = bcrypt.genSaltSync(15);
        const password = bcrypt.hashSync(pwd, salt);
        return password;
    }

    public static convertTermninalsArrayObject(arrofTerminals: any[]) {
      return arrofTerminals.map(i => i.terminalId);
    }

    public static validatePassword(password: string, userpassword: string) {
        const isValid = bcrypt.compareSync(password, userpassword);
        return isValid;
      }
    
    public static generateAccessToken(data: object, key: string) {
        console.log(process.env.JWTTOKENEXPIRESIN);
        const authToken = jwt.sign(
          JSON.parse(JSON.stringify(data)), key,
          { expiresIn: process.env.JWTTOKENEXPIRESIN },
        );
        return authToken;
    }

    public static convertCSVDataToJson(tmppath: any) {
        const jsondata = [];
    
        return new Promise((resolve, reject) => {
          fs.createReadStream(tmppath)
            .pipe(csv())
            .on('data', (data: any) => {
              jsondata.push(data);
            })
            .on('end', () => {
              fs.unlinkSync(tmppath);
              resolve(jsondata);
            });
        });
    }

    public static multerTempUploadHandler() {
        const uploadHandler = multer({ dest: path.join(__dirname, './tmp/csv/') });
        return uploadHandler;
    }

    public static hmacsha256(data: string, secret: string) {
      let sha256 = CryptoJS.HmacSHA256(data, secret);
      let base64encoded = CryptoJS.enc.Base64.stringify(sha256);
  
      return base64encoded;
    }

    public static round2dp(amount: string) {
      return parseFloat(amount).toFixed(2);
    }
  
    public static base64(data: any) {
      let encrypted = Buffer.from(data).toString("base64");
      return encrypted;
    }
  
    public static splitString(string: string, separator: string) {
      return string.split(separator);
    }
  
    /**
     * generate date query
     * @param {*} match match query
     * @param {*} filter filter from the request
     */
    public static setRange(match: any, filter: any, not = false) {
      if (filter.range == dateGroup.daily) {
        if (filter.date) {
          match.createdAt = {
            $gte: moment(filter.date, "YYYYMMDD")
              .tz("Africa/Lagos")
              .startOf("day")
              .toDate(),
            $lte: moment(filter.date, "YYYYMMDD")
              .tz("Africa/Lagos")
              .endOf("day")
              .toDate(),
          };
        } else {
          match.createdAt = {
            $gte: moment().tz("Africa/Lagos").startOf("day").toDate(),
            $lte: moment().tz("Africa/Lagos").endOf("day").toDate(),
          };
        }
  
        if (not) {
          match.createdAt = {
            $lt: match.createdAt.$gte,
          };
        }
      } else if (filter.range == dateGroup.weekly) {
        if (filter.weekofyear) {
          let weekyear = filter.weekofyear.split("-");
          if (weekyear.length == 2) {
            let week = weekyear[0];
            let year = weekyear[1];
  
            match.createdAt = {
              $gte: moment()
                .tz("Africa/Lagos")
                .year(year)
                .week(week)
                .startOf("week")
                .toDate(),
              $lte: moment()
                .tz("Africa/Lagos")
                .year(year)
                .week(week)
                .endOf("week")
                .toDate(),
            };
          }
        } else {
          match.createdAt = {
            $gte: moment().tz("Africa/Lagos").startOf("week").toDate(),
            $lte: moment().tz("Africa/Lagos").endOf("week").toDate(),
          };
        }
  
        if (not) {
          match.createdAt = {
            $lt: match.createdAt.$gte,
          };
        }
      } else if (filter.range == dateGroup.monthly) {
        if (filter.monthofyear) {
          let monthyear = filter.monthofyear.split("-");
  
          if (monthyear.length == 2) {
            let month = monthyear[0];
            let year = monthyear[1];
  
            match.createdAt = {
              $gte: moment()
                .tz("Africa/Lagos")
                .year(year)
                .month(Number(month) - 1)
                .startOf("month")
                .toDate(),
              $lte: moment()
                .tz("Africa/Lagos")
                .year(year)
                .month(Number(month) - 1)
                .endOf("month")
                .toDate(),
            };
          }
        } else {
          match.createdAt = {
            $gte: moment().tz("Africa/Lagos").startOf("month").toDate(),
            $lte: moment().tz("Africa/Lagos").endOf("month").toDate(),
          };
        }
  
        if (not) {
          match.createdAt = {
            $lt: match.createdAt.$gte,
          };
        }
      }
      //// todo bi-annual
      else if (filter.range == dateGroup.biAnnual) {
        if (filter.monthofyear) {
          let monthyear = filter.monthofyear.split("-");
  
          if (monthyear.length == 2) {
            let month = monthyear[0];
            let year = monthyear[1];
  
            match.createdAt = {
              $gte: moment()
                .tz("Africa/Lagos")
                .month(month)
                .year(year)
                .subtract(6, "month")
                .startOf("month")
                .toDate(),
              $lte: moment()
                .tz("Africa/Lagos")
                .month(month)
                .year(year)
                .endOf("month")
                .toDate(),
            };
          }
        } else {
          match.createdAt = {
            $gte: moment()
              .tz("Africa/Lagos")
              .subtract(6, "month")
              .startOf("month")
              .toDate(),
            $lte: moment().tz("Africa/Lagos").endOf("month").toDate(),
          };
        }
  
        if (not) {
          match.createdAt = {
            $lt: match.createdAt.$gte,
          };
        }
      } else if (filter.range == dateGroup.annual) {
        if (filter.year) {
          let year = filter.year;
  
          match.createdAt = {
            $gte: moment().tz("Africa/Lagos").year(year).startOf("year").toDate(),
            $lte: moment().tz("Africa/Lagos").year(year).endOf(year).toDate(),
          };
        } else {
          match.createdAt = {
            $gte: moment().tz("Africa/Lagos").startOf("year").toDate(),
            $lte: moment().tz("Africa/Lagos").endOf("year").toDate(),
          };
        }
  
        if (not) {
          match.createdAt = {
            $lt: match.createdAt.$gte,
          };
        }
      } else if (filter.range == dateGroup.range) {
        if (filter.startdate && filter.enddate) {
          match.createdAt = {
            $gte: moment(filter.startdate, "YYYYMMDD")
              .tz("Africa/Lagos")
              .startOf("day")
              .toDate(),
            $lte: moment(filter.enddate, "YYYYMMDD")
              .tz("Africa/Lagos")
              .endOf("day")
              .toDate(),
          };
        } else {
          match.createdAt = {
            $gte: moment().tz("Africa/Lagos").startOf("day").toDate(),
            $lte: moment().tz("Africa/Lagos").endOf("day").toDate(),
          };
        }
  
        if (not) {
          match.createdAt = {
            $lt: match.createdAt.$gte,
          };
        }
      } else {
        match.createdAt = {
          $gte: moment().tz("Africa/Lagos").startOf("day").toDate(),
          $lte: moment().tz("Africa/Lagos").endOf("day").toDate(),
        };
  
        if (not) {
          match.createdAt = {
            $lt: match.createdAt.$gte,
          };
        }
      }
  
      return match;
    }
  
    public static setPaging(filter: any) {
      filter.pageSize = Number(filter.pagesize) || Number(filter.pageSize) || 50;
      filter.page = Number(filter.page) || 1;
      filter.skip = (filter.page - 1) * filter.pageSize;
      return filter;
    }
  
    public static TidsFromBank(bankCode: string) {
      if (!bankCode) return [];
  
      if (bankCode == "ACCESS") {
        return ["2044", "2063"];
      } else if (bankCode == "ECO") {
        return ["2050", "2056"];
      } else if (bankCode == "FIDELITY") {
        return ["2070"];
      } else if (bankCode == "FIRST") {
        return ["2011", "2701"];
      } else if (bankCode == "FCMB") {
        return ["2214", "2085"];
      } else if (bankCode == "HERITAGE") {
        return ["2030", "2084"];
      } else if (bankCode == "KEYSTONE") {
        return ["2082"];
      } else if (bankCode == "SKYE") {
        return ["2076"];
      } else if (bankCode == "STANBIC") {
        return ["2039"];
      } else if (bankCode == "UNION") {
        return ["2032"];
      } else if (bankCode == "UBA") {
        return ["2033"];
      } else if (bankCode == "WEMA") {
        return ["2035"];
      } else if (bankCode == "ZENITH") {
        return ["2057"];
      } else if (bankCode == "STERLING") {
        return ["2232"];
      } else if (bankCode == "GTBANK") {
        return ["2058"];
      } else if (bankCode == "UNITY") {
        return ["2215"];
      } else if (bankCode == "PROVIDUS") {
        return ["2101"];
      } else {
        return [];
      }
    }
  
    /**
     *
     * @param {Array} data array to sum
     * @param {String} prop property of the array to sum
     */
    public static percentageCalc(failedVal: number, successVal: number) {
      let perc: any = {};
      perc.failed = parseFloat(
        ((failedVal / (failedVal + successVal)) * 100).toFixed(2)
      );
      perc.success = parseFloat((100 - perc.failed).toFixed(2));
      return perc;
    }
  
    /**
     *
     * */
    public static sumObjectProp(data: any, prop: any) {
      return data.reduce((a: any, b: any) => a + (b[prop] || 0), 0);
    }
  
    public static doSHA512(toHash: string) {
      let hash = crypto.createHash("sha512");
      hash.update(toHash);
      return hash.digest("hex");
    }

    public static doSHA256(toHash: string) {
      let hash = crypto.createHash("sha256");
      hash.update(toHash);
      return hash.digest("hex");
    }


    
  
    /**
     *
     * @param {Object} data excel data
     * @param {String} tag name of the report
     * @param {String} band
     * @param {boolean} noTrans true | false
     * @returns {Promise<String>} generated file path.
     */
    public static async generateForBandExcel(data: any[], tag: any, band: string, noTrans: boolean = false, date = 1): Promise<any> {
      try {
        let mIds = data.map((tm) => {
          return tm.merchantId;
        });
  
        console.log(JSON.stringify(mIds));
  
        let merchantInfo = await Merchants.aggregate([
          
          { $match: { merchant_id: { $in: mIds } } },
        ])
          .allowDiskUse(true)
          .read("secondary");
  
        data = data.map((tm) => {
          let merchant = merchantInfo.find((c) => c.merchant_id == tm.merchantId);
          let result: any = {
            terminalId: tm.terminalId,
            merchantId: tm.merchantId,
          };
  
          if (!noTrans) {
            let last = tm.transactions.pop();
            result.trans_value = Utils.formatAmount(last.amount || 0);
            result.trans_volume = last.volume || 0;
            result.date = last.date;
          }
  
          if (merchant) {
            result.merchant_name = merchant.merchant_name || "Not Available";
            result.merchant_email = merchant.merchant_email || "Not Available";
            result.merchant_address =
              merchant.merchant_address || "Not Available";
          } else {
            result.merchant_name = "Not Available";
            result.merchant_email = "Not Available";
            result.merchant_address = "Not Available";
          }
          return result;
        });
  
        let xls = xlsJson(data);
  
        let filePath = `Reports/Band${band.toUpperCase()}/${tag}-${moment()
          .tz("Africa/Lagos")
          .subtract(date, "day")
          .toDate()
          .toDateString()}.xlsx`;
        let pathDir = path.dirname(filePath);
  
        if (fs.existsSync(pathDir) == false) {
          console.log(fs.existsSync(pathDir));
          fs.mkdirSync(pathDir, { recursive: true });
        }
  
        fs.writeFileSync(filePath, xls, "binary");
  
        return filePath;
      } catch (error) {
        return false;
      }
    }

    public async mapTerminalsFromMerchantCodeQuery(terminals: any[]) {

      if(!terminals || terminals.length <= 0) return false;

      return terminals.map((i: any) => i.terminalId); 

    }


  
    async generateForExcelMidDay(data: any[], tag: any, band = "A") {
      try {
        let mIds = data.map((tm) => {
          return tm.merchantId;
        });
  
        let merchantInfo = await Merchants.aggregate([
          { $match: { merchant_id: { $in: mIds } } },
        ])
          .allowDiskUse(true)
          .read("secondary");
  
        data = data.map((tm) => {
          let merchant = merchantInfo.find((c) => c.merchant_id == tm.merchantId);
          let result: any = {
            terminalId: tm.terminalId,
            merchantId: tm.merchantId,
            amount: Utils.formatAmount(tm.amount || 0),
            volume: tm.volume,
          };
  
          if (merchant) {
            result.merchant_name = merchant.merchant_name || "Not Available";
            result.merchant_email = merchant.merchant_email || "Not Available";
            result.merchant_address =
              merchant.merchant_address || "Not Available";
          } else {
            result.merchant_name = "Not Available";
            result.merchant_email = "Not Available";
            result.merchant_address = "Not Available";
          }
          return result;
        });
  
        let xls = xlsJson(data);
  
        let filePath = `Reports/Band${band.toUpperCase()}/${tag}-${moment()
          .tz("Africa/Lagos")
          .toDate()
          .toDateString()}.xlsx`;
        let pathDir = path.dirname(filePath);
  
        if (fs.existsSync(pathDir) == false) {
          console.log(fs.existsSync(pathDir));
          fs.mkdirSync(pathDir, { recursive: true });
        }
  
        fs.writeFileSync(filePath, xls, "binary");
  
        return filePath;
      } catch (error) {
        return false;
      }
    }
  
    async generateForBandExcelWeekly(data: any[], tag: any, band: string, noTrans = false, date = 1) {
      try {
        let mIds = data.map((tm) => {
          return tm.merchantId;
        });
  
        // console.log(JSON.stringify(mIds))
  
        let merchantInfo = await Merchants.aggregate([
          { $match: { merchant_id: { $in: mIds } } },
        ])
          .allowDiskUse(true)
          .read("secondary");
  
        data = data.map((tm) => {
          let merchant = merchantInfo.find((c) => c.merchant_id == tm.merchantId);
          let result: any = {
            terminalId: tm.terminalId,
            merchantId: tm.merchantId,
          };
  
          for (let index = 6; index >= 0; index--) {
            let yesterday = moment().tz("Africa/Lagos").subtract(date, "day");
            let day = yesterday.subtract(index, "day").format("YYYY-MM-DD");
            let dateData = tm.transactions.find(
              (c: { date: moment.MomentInput; }) => moment(c.date).format("YYYY-MM-DD") == day
            );
            if (dateData) {
              result[day] = Utils.formatAmount(dateData.amount || 0);
            } else {
              result[day] = Utils.formatAmount(0);
            }
          }
  
          result["Week_Amount"] = Utils.formatAmount(tm.weekAmount || 0);
          result["Amount_Change"] = tm.amountChange;
          result["Week_Volume"] = tm.weekVolume;
          result["Volume_Change"] = tm.volumeChange;
  
          if (merchant) {
            result.merchant_name = merchant.merchant_name || "Not Available";
            result.merchant_email = merchant.merchant_email || "Not Available";
            result.merchant_address =
              merchant.merchant_address || "Not Available";
          } else {
            result.merchant_name = "Not Available";
            result.merchant_email = "Not Available";
            result.merchant_address = "Not Available";
          }
          return result;
        });
  
        let xls = xlsJson(data);
  
        let filePath = `Reports/Band${band.toUpperCase()}/${tag}-${moment()
          .tz("Africa/Lagos")
          .subtract(date, "day")
          .toDate()
          .toDateString()}.xlsx`;
        let pathDir = path.dirname(filePath);
  
        if (fs.existsSync(pathDir) == false) {
          console.log(fs.existsSync(pathDir));
          fs.mkdirSync(pathDir, { recursive: true });
        }
  
        fs.writeFileSync(filePath, xls, "binary");
  
        return filePath;
      } catch (error) {
        console.log(error);
        return false;
      }
    }
  
    public static padLeft(data, padChar, length) {
      let result = data;
      while (result.length < length) {
        result = padChar + result;
      }
      return result;
    }
  
    public static padRight(data: any, padChar: any, length: number) {
      let result = data;
      while (result.length < length) {
        result += padChar;
      }
      return result;
    }
  
    public static async generateForTerminalState(data: any[]) {
      try {
        let mIds = data.map((tm) => {
          return tm.merchantId;
        });
  
        // console.log(JSON.stringify(mIds))
  
        let merchantInfo = await Merchants.aggregate([
          { $match: { merchant_id: { $in: mIds } } },
        ])
          .allowDiskUse(true)
          .read("secondary");
  
        data = data.map((tm) => {
          let merchant = merchantInfo.find((c) => c.merchant_id == tm.merchantId);
          let ltnrg = moment().diff(moment(tm.last_Transaction), "days");
          tm.status = ltnrg >= 30 ? "INACTIVE" : "ACTIVE";
          if (merchant) {
            tm.merchant_name = merchant.merchant_name || "Not Available";
            tm.merchant_email = merchant.merchant_email || "Not Available";
            tm.merchant_address = merchant.merchant_address || "Not Available";
          } else {
            tm.merchant_name = "Not Available";
            tm.merchant_email = "Not Available";
            tm.merchant_address = "Not Available";
          }
          return tm;
        });
  
        let xls = xlsJson(data);
  
        let filePath = `Reports/states/terminals-state-${moment()
          .tz("Africa/Lagos")
          .toDate()
          .toDateString()}.xlsx`;
        let pathDir = path.dirname(filePath);
  
        if (fs.existsSync(pathDir) == false) {
          console.log(fs.existsSync(pathDir));
          fs.mkdirSync(pathDir, { recursive: true });
        }
  
        fs.writeFileSync(filePath, xls, "binary");
  
        return filePath;
      } catch (error) {
        console.log(error);
        return false;
      }
    }
  
    public static async generateForTrans(data: any[], tag: any) {
      try {
        const mIds = data.map((tm: { merchantId: any; }) => {
          return tm.merchantId;
        });
  
        // console.log(JSON.stringify(mIds))
  
        const merchantInfo = await Merchants.aggregate([
          { $match: { merchant_id: { $in: mIds } } },
        ])
          .allowDiskUse(true)
          .read("secondary");
  
        data = data.map((tm) => {
          // console.log("tm",tm)
  
          tm.amount = Utils.formatAmount(tm.amount / 100);
          if (tm.totalAmount)
            tm.totalAmount = Utils.formatAmount(tm.totalAmount / 100);
  
          const merchant = merchantInfo.find(
            (c) => c.merchant_id == tm.merchantId
          );
          if (merchant) {
            tm.merchant_name = merchant.merchant_name || "Not Available";
            tm.merchant_email = merchant.merchant_email || "Not Available";
            tm.merchant_address = merchant.merchant_address || "Not Available";
          } else {
            tm.merchant_name = "Not Available";
            tm.merchant_email = "Not Available";
            tm.merchant_address = "Not Available";
          }
          return tm;
        });
  
        let xls = xlsJson(data);
  
        let filePath = `Reports/states/${tag}-${moment()
          .tz("Africa/Lagos")
          .toDate()
          .toDateString()}.xlsx`;
        let pathDir = path.dirname(filePath);
  
        if (fs.existsSync(pathDir) == false) {
          console.log(fs.existsSync(pathDir));
          fs.mkdirSync(pathDir, { recursive: true });
        }
  
        fs.writeFileSync(filePath, xls, "binary");
  
        return filePath;
      } catch (error) {
        console.log(error);
        return false;
      }
    }
  
    public static async generateForSameTimeTrans(data: any[], tag: any) {
      try {
        const mIds = data.map((tm) => {
          return tm.merchantId;
        });
  
        // console.log(JSON.stringify(mIds))
  
        const merchantInfo = await Merchants.aggregate([
          { $match: { merchant_id: { $in: mIds } } },
        ])
          .allowDiskUse(true)
          .read("secondary");
  
        data = data.map((tm) => {
          const merchant = merchantInfo.find(
            (c) => c.merchant_id == tm.merchantId
          );
  
          tm.trxns = JSON.stringify(tm.trxns);
  
          if (merchant) {
            tm.merchant_name = merchant.merchant_name || "Not Available";
            tm.merchant_email = merchant.merchant_email || "Not Available";
            tm.merchant_address = merchant.merchant_address || "Not Available";
          } else {
            tm.merchant_name = "Not Available";
            tm.merchant_email = "Not Available";
            tm.merchant_address = "Not Available";
          }
          return tm;
        });
  
        let xls = xlsJson(data);
  
        let filePath = `Reports/states/${tag}-${moment()
          .tz("Africa/Lagos")
          .toDate()
          .toDateString()}.xlsx`;
        let pathDir = path.dirname(filePath);
  
        if (fs.existsSync(pathDir) == false) {
          console.log(fs.existsSync(pathDir));
          fs.mkdirSync(pathDir, { recursive: true });
        }
  
        fs.writeFileSync(filePath, xls, "binary");
  
        return filePath;
      } catch (error) {
        console.log(error);
        return false;
      }
    }
  
    public static fileDataLogger(terminalId: string, msg: any) {
      let filesPath = path.join(`mw-logs`, terminalId + `-logfile.log`);
      console.log(filesPath);
      let pathDir = path.dirname(filesPath);
      if (fs.existsSync(pathDir) == false) {
        console.log(pathDir);
        fs.mkdirSync(pathDir);
      }
  
      let logger = SimpleNodeLogger.createSimpleLogger({
        logFilePath: filesPath,
        timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS",
      });
  
      console.log("info", msg);
  
      logger.log("info", msg);
    }
  
    public static formatAmount(amount: any) {
      return new Intl.NumberFormat("en-US", {
        currency: "NGN",
        minimumFractionDigits: 2,
      }).format(amount / 100);
    }
  
    public static removeFile(filesPath: string) {
      setTimeout(() => {
        fs.unlink(filesPath, (err) => {
          if (err) console.log(`error removing file ${filesPath}`);
        });
      }, 10 * (60 * 1000));
    }
  
    public static getReportHeaders() {
      let fields = [
        "handlerUsed",
        "rrn",
        "merchantName",
        "merchantAddress",
        "merchantId",
        "terminalId",
        "STAN",
        "transactionTime",
        "handlerResponseTime",
        "merchantCategoryCode",
        "MTI",
        "maskedPan",
        "processingCode",
        "amount",
        "customerRef",
        "messageReason",
        "responseCode",
        "authCode",
        "notified",
      ];
  
      return fields.map((f) => {
        return { header: f, key: f, width: 10 };
      });
    }
  
    public static async  generateFilename() {
      let date = new Date();
  
      let filename = `transaction-report-${date.getTime().toString()}.xlsx`;
  
      let filesPath = `Report/${filename}`;
      let pathDir = path.dirname(filesPath);
      if (fs.existsSync(pathDir) == false) {
        fs.mkdirSync(pathDir);
      }
  
      return filename;
    }
  
    public static async pullFile(fileName: string) {
      let filename = `Report/${fileName}`;
  
      if (fs.existsSync(filename)) {
        return filename;
      }
      return false;
    }
  
    public static async hashPassword(password: string) {
      let salt = bcrypt.genSaltSync(10);
  
      let hash = bcrypt.hashSync(password, salt);
      return hash;
    }

    public static AESEncrypt(data: string) {
      return CryptoJS.AES.encrypt(data, process.env.API_SECRET_KEY).toString();
    }
  
    public static AESDecrypt(data: string) {
      const byteArray = CryptoJS.AES.decrypt(data, process.env.API_SECRET_KEY);
      return byteArray.toString(CryptoJS.enc.Utf8);
    }
  
    public static async comparePassword(hashedPassword: string, plainPassword: string) {
      return bcrypt.compareSync(plainPassword, hashedPassword);
    }
  
    public static async encryptRSA(data: string) {
      //GTB dispute log encryption
      let publicKey = process.env.GTBpublicKey;
  
      const encryptedData = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        // We convert the data string to a buffer using `Buffer.from`
        Buffer.from(data)
      );
  
      return encryptedData.toString("base64");
    }
  
    public static async generateGTBIds(length: number) {
      // let date = new Date();
      var nowMin = moment().minutes();
      var nowSec = moment().seconds();
      let extraId = moment().format("YYYYMMDD,YYYYhhmmss"); //date.getTime().toString()
  
      if (length < 7) extraId = "";
  
      let random = Math.floor(100000 + Math.random() * 900000);
      return random.toString() + extraId;
    }
  
    public static async validateInputData(req: Request) {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errors.array();
      }
      return false;
    }
  
    public static async isObjectEmpty(object: any) {
      if (object == null) return true;
  
      return Object.keys(object).length === 0 && object.constructor === Object;
    }
  
    public static failedResponse: {
      message: "transaction details not found",
    }
  
    public static invalidResponse: {
      message: "Only Approved transactions can be logged",
    }
  
    public static getObjectSize(object: any) {
      var size = 0,
        key: any;
      for (key in object) {
        if (object.hasOwnProperty(key)) size++;
      }
      return size;
    }
  
    public static distinctArr(value: any, index: any, arr: any[]) {
      return arr.indexOf(value) == index;
    }
  
    public static getNibssResponseMessageFromCode(code: string) {
      switch (code) {
        case "00":
          return "Approved";
        case "01":
          return "Refer to card issuer";
        case "02":
          return "Refer to card issuer, special condition";
        case "03":
          return "Invalid merchant";
        case "04":
          return "Pick-up card";
        case "05":
          return "Do not honor";
        case "06":
          return "Error";
        case "07":
          return "Pick-up card, special condition";
        case "08":
          return "Honor with identification";
        case "09":
          return "Request in progress";
        case "10":
          return "Approved,partial";
        case "11":
          return "Approved,VIP";
        case "12":
          return "Invalid transaction";
        case "13":
          return "Invalid amount";
        case "14":
          return "Invalid card number";
        case "15":
          return "No such issuer";
        case "16":
          return "Approved,update track 3";
        case "17":
          return "Customer cancellation";
        case "18":
          return "Customer dispute";
        case "19":
          return "Re-enter transaction";
        case "20":
          return "Invalid response";
        case "21":
          return "No action taken";
        case "22":
          return "Suspected malfunction";
        case "23":
          return "Unacceptable transaction fee";
        case "24":
          return "File update not supported";
        case "25":
          return "Unable to locate record";
        case "26":
          return "Duplicate record";
        case "27":
          return "File update edit error";
        case "28":
          return "File update file locked";
        case "29":
          return "File update failed";
        case "30":
          return "Format error";
        case "31":
          return "Bank not supported";
        case "32":
          return "Completed, partially";
        case "33":
          return "Expired card, pick-up";
        case "34":
          return "Suspected fraud, pick-up";
        case "35":
          return "Contact acquirer, pick-up";
        case "36":
          return "Restricted card, pick-up";
        case "37":
          return "Call acquirer security, pick-up";
        case "38":
          return "PIN tries exceeded, pick-up";
        case "39":
          return "No credit account";
        case "40":
          return "Function not supported";
        case "41":
          return "Lost card";
        case "42":
          return "No universal account";
        case "43":
          return "Stolen card";
        case "44":
          return "No investment account";
        case "51":
          return "Not sufficent funds";
        case "52":
          return "No check account";
        case "53":
          return "No savings account";
        case "54":
          return "Expired card";
        case "55":
          return "Incorrect PIN";
        case "56":
          return "No card record";
        case "57":
          return "Transaction not permitted to cardholder";
        case "58":
          return "Transaction not permitted on terminal";
        case "59":
          return "Suspected fraud";
        case "60":
          return "Contact acquirer";
        case "61":
          return "Exceeds withdrawal limit";
        case "62":
          return "Restricted card";
        case "63":
          return "Security violation";
        case "64":
          return "Original amount incorrect";
        case "65":
          return "Exceeds withdrawal frequency";
        case "66":
          return "Call acquirer security";
        case "67":
          return "Hard capture";
        case "68":
          return "Response received too late";
        case "75":
          return "PIN tries exceeded";
        case "77":
          return "Intervene, bank approval required";
        case "78":
          return "Intervene, bank approval required for partial amount";
        case "90":
          return "Cut-off in progress";
        case "91":
          return "Issuer or switch inoperative";
        case "92":
          return "Routing error";
        case "93":
          return "Violation of law";
        case "94":
          return "Duplicate transaction";
        case "95":
          return "Reconcile error";
        case "96":
          return "System malfunction";
        case "98":
          return " Exceeds cash limit";
        // custom by me
        case "99":
          return "no Response";
        case "100":
          return "Request Timedout";
        case "101":
          return "Failover Direct";
        ///////////////
        default:
          return "unknown";
      }
    }
  
    public static bankfromTID(terminalId: string, getCode = false) {
      
      if (!terminalId) return false;
  
      let term = terminalId.slice(0, 4);
      if (["2044", "2063"].includes(term)) {
        if (getCode) return "ACCESS";
        return "ACCESS BANK";
      } else if (["2050", "2056"].includes(term)) {
        if (getCode) return "ECO";
        return "ECO BANK";
      } else if (["2070"].includes(term)) {
        if (getCode) return "FIDELITY";
        return "FIDELITY BANK";
      } else if (["2011", "2071", "2701"].includes(term)) {
        if (getCode) return "FIRST";
        return "FIRST BANK";
      } else if (["2214", "2085"].includes(term)) {
        if (getCode) return "FCMB";
        return "FCMB BANK";
      } else if (["2030", "2084"].includes(term)) {
        if (getCode) return "HERITAGE";
        return "HERITAGE BANK";
      } else if (["2082"].includes(term)) {
        if (getCode) return "KEYSTONE";
        return "KEYSTONE BANK";
      } else if (["2076"].includes(term)) {
        if (getCode) return "SKYE";
        return "SKYE BANK";
      } else if (["2039"].includes(term)) {
        if (getCode) return "STANBIC";
        return "STANBIC IBTC BANK";
      } else if (["2032"].includes(term)) {
        if (getCode) return "UNION";
        return "UNION BANK";
      } else if (["2033"].includes(term)) {
        if (getCode) return "UBA";
        return "UBA BANK";
      } else if (["2035"].includes(term)) {
        if (getCode) return "WEMA";
        return "WEMA BANK";
      } else if (["2057"].includes(term)) {
        if (getCode) return "ZENITH";
        return "ZENITH BANK";
      } else if (["2232"].includes(term)) {
        if (getCode) return "STERLING";
        return "STERLING BANK";
      } else if (["2058"].includes(term)) {
        if (getCode) return "GTBANK";
        return "GTBANK";
      } else if (["2215"].includes(term)) {
        if (getCode) return "UNITY";
        return "UNITY BANK";
      } else if (["2101"].includes(term)) {
        if (getCode) return "PROVIDUS";
        return "PROVIDUS BANK";
      } else {
        return "UNKNOWN";
      }
    }
  
    public static getCardType(pan: string) {
      let check = pan.substr(0, 2);
  
      if (pan.startsWith("4")) return "VISA";
      else if (
        ["51", "52", "53", "54", "55"].includes(check) ||
        pan.startsWith("2")
      )
        return "MASTERCARD";
      else if (["50", "65"].includes(check)) return "VERVE";
      else if (["34", "37"].includes(check)) return "AMERICAN-EXPRESS";
      else if (pan.startsWith("3528") || pan.startsWith("3589")) return "JCB";
      else return "CARD";
    }
  
    public static startsWith(str: string | any[], word: any) {
      return str.lastIndexOf(word, 0) === 0;
    }



}

export default Utils;