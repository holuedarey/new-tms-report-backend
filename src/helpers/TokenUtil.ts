import jsonwebtoken from 'jsonwebtoken';
import cryptojs from 'crypto-js';
import Logger from './Logger';

/**
 * @class TokenUtil
 * Handle JWT Token Management
 */
class TokenUtil {
  /**
   * Sign payload and returns JWT
   * @param {Object} payload
   * @param {String} time - Expiry time
   */
  static sign(payload, time = '10d') {
    return jsonwebtoken.sign(payload, process.env.API_SECRET_KEY, { expiresIn: time });
  }

  /**
   * Verifies JWT and returns Payload
   * @param {String} token - JWT
   */
  static verify(token) {
    try {
      return jsonwebtoken.verify(token, process.env.API_SECRET_KEY);
    } catch (error) {
      return null;
    }
  }

  // static AESEncrypt(str) {
  //   let byteArray = '';
  //   try {
  //     byteArray = cryptojs.AES.encrypt(str || '', process.env.PTSP_API_SECRET_KEY);
  //   } catch (error) { Logger.log(error); }
  //   return byteArray.toString();
  // }

  // static AESDecrypt(str) {
  //   let byteArray = '';
  //   try {
  //     byteArray = cryptojs.AES.decrypt(str || '', process.env.PTSP_API_SECRET_KEY);
  //     byteArray = byteArray.toString(cryptojs.enc.Utf8);
  //   } catch (error) { Logger.log(error); }
  //   return byteArray;
  // }
}

export default TokenUtil;
