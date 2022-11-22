import ApiResponse from "../helpers/apiResponse";
import {apiStatusCodes} from '../helpers/constants';
import { BINS } from '../bin';
import fs from 'fs';
import path from 'path';
import { IUsers } from "../interfaces/db.models";


/**
 * Returns bank and brand from in json
 * @param {String} bin
 */
const binConverter = (bin) => {
  let result = BINS.find(item => (item.bin == parseInt(bin)))
  return result;
};

const getCardType= (pan) => {
 
  let check = pan.substr(0,2);
  
  if(pan.startsWith("4")) return "VISA";
  else if(["51","52","53","54","55"].includes(check) || pan.startsWith("2")) return "MASTERCARD";
  else if(["50","65"].includes(check)) return "VERVE";
  else if(["34","37"].includes(check)) return "AMERICAN-EXPRESS";
  else if(pan.startsWith("3528") || pan.startsWith("3589")) return "JCB";
  else return "CARD";
}

/**
 * Returns current date string
 * @param {String} sep
 */
const curDate = (sep = '-') => {
  const today = new Date();
  return today.getFullYear()
    + sep + `${(today.getMonth() + 1)}`.padStart(2, '0')
    + sep + `${today.getDate()}`.padStart(2, '0');
};

const getDbName = (baseName = 'journals') => {
  const currentDate = new Date();
  // const dataInterval = 3
  const currentMonth = currentDate.getMonth() + 1;
  let collection = "";
  const year = currentDate.getFullYear().toString().substr(-2)
  if (currentMonth == 1 || currentMonth < 3) {
    collection = `${baseName}_${year}_01_03`
  } else if (currentMonth > 3 || currentMonth < 7) {
    collection = `${baseName}_${year}_04_06`
  } else if (currentMonth > 7 || currentMonth < 9) {
    collection = `${baseName}_${year}_07_09`
  } else if (currentMonth > 9 || currentMonth <= 12) {
    collection = `${baseName}_${year}_10_12`
  }
  return  collection
}
/**
 * Validates a date
 * @param {String} date - Date String
 * @param {Object} res - Express Ressponse
 */
const validateDate = (date = '', res) => {
  const parts = date.split(' ')[0].split('-');
  if (parts[0].length !== 4 || parts[1].length !== 2 || parts[2].length !== 2) {
    ApiResponse.send(res, apiStatusCodes.badRequest, '', {
      error: "Date format must be 'yyyy-mm-dd'.",
    });
    return false;
  }
  return true;
};

/**
 * Converts excel date number to date
 * @param {Number} serial
 */
const excelDateConverter = (serial) => {
  if (typeof serial !== 'number' && !Number.isNaN(Date.parse(serial))) {
    return new Date(serial);
  }
  if (Number.isNaN(serial) || serial < 25569) return serial;
  const utcDays = serial - 25569;
  const utcValue = utcDays * 86400;
  return new Date(utcValue * 1000);
};

/**
 * Returns number of unique items in a given array data.
 * @param {*} iterable - Array value
 */
const countUnique = iterable => new Set(iterable).size;

/**
 * Excapes regex
 * @param {String} text
 */
const escapeRegExp = text => `${text}`.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

/**
 * Creates regex
 * @param {String} text
 */
const getRegExp = text => new RegExp(escapeRegExp(text), 'i');

/**
 * Validate an email
 * @param {String} str
 */
const validateEmail = str => /^[\w._]+@[\w]+[-.]?[\w]+\.[\w]+$/.test(str);
const checkNumber = input => `${input}`.search(/\D/) < 0;

const validateMongoID = str => `${str}`.match(/^[0-9a-fA-F]{24}$/);
const validateFile = str => `${str}`.match(/files\/settlements\/[A-Za-z\-0-9.]*/);

const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (const i in a) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const arraysNoCaseEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (const i in a) {
    const c = typeof a[i] === 'string' ? a[i].toLowerCase() : a[i];
    const d = typeof b[i] === 'string' ? b[i].toLowerCase() : b[i];
    if (c !== d) return false;
  }
  return true;
};

const hasRole = (user: IUsers,  role:string) => {
  if (!Array.isArray(user.roles) || !user.roles.includes(role)) {
    return false;
  }
  return true;
};

const generateFilename = async ()=> {
  let date = new Date();

  let filename = `transaction-report-${date.getTime().toString()}.xlsx`;

  let filesPath = `Report/${filename}`;
  let pathDir = path.dirname(filesPath);
  if (fs.existsSync(pathDir) == false) {
    fs.mkdirSync(pathDir);
  }

  return filename;
}

const getReportHeaders = () => {
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
    "issuer",
    "responseTime",
  ];

  return fields.map((f) => {
    return { header: f, key: f, width: 10 };
  });
}

const removeFile = (filesPath) => {
  setTimeout(() => {
    fs.unlink(filesPath, (err) => {
      if (err) console.log(`error removing file ${filesPath}`);
    });
  }, 10*(60*1000));
}

const hasAdminRole = user => hasRole(user, 'admin') || hasRole(user, 'super' );

/**
 * Returns previous date range from the given date range
 * @param {Date} start - Date string
 * @param {Date} end - Date string
 */
 const getPrevStartEndDate = (start, end) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = +new Date(end) - +new Date(start) + oneDay;
  const prevStart = +new Date(start) - diff;
  const prevEnd = +new Date(start) - oneDay;
  const sDate = new Date(prevStart);
  const eDate = new Date(prevEnd);
  const sep = '-';
  return {
    start: sDate.getFullYear() + sep + (sDate.getMonth() + 1) + sep + sDate.getDate(),
    end: eDate.getFullYear() + sep + (eDate.getMonth() + 1) + sep + eDate.getDate(),
  };
};

export {
  getPrevStartEndDate, getDbName, curDate, validateDate, excelDateConverter, getRegExp, validateEmail,
  validateMongoID, validateFile, arraysEqual, hasRole, hasAdminRole, checkNumber,
  countUnique, arraysNoCaseEqual, binConverter, getCardType, generateFilename,
  getReportHeaders, removeFile,
};
