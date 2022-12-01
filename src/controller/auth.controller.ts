import { Request, Response } from 'express';
import AuthServices from '../services/auth.services';
import ApiResponse from '../helpers/apiResponse';
import { apiStatusCodes } from '../helpers/constants';
import AuditEvent from '../events/audits.events';
import { AuditEventResources, AuditActionResources } from '../db/model/audit.model';
import { validateEmail } from '../helpers/util';
import usersModel from '../db/model/users.model';
import { getUserFromToken } from '../middlewares/validators/requestValidator';
import bcrypt from 'bcrypt';
import sendEmailSms from '../helpers/emailSender';

class AuthController {

   /**
    * 
    * @param request 
    * @param response 
    * @returns 
    */
   public async signIn(request: Request, response: Response) {

      try {
         const signRespponse = await AuthServices.signIn(request.body.username, request.body.password);

         if (signRespponse.error) {

            return ApiResponse.error(response, apiStatusCodes.badRequest, { ...signRespponse.data }, signRespponse.message);

         }

         const ts_hms = new Date().toISOString();
         const aduitPayload = {
            auditActivity: AuditEventResources.UsersView,
            auditType: AuditActionResources.UsersLogin,
            description: `${signRespponse.data.user.emailAddress} Login @ ${ts_hms}`,
            user: {
               name: signRespponse.data.user.name || "",
               email: signRespponse.data.user.emailAddress,
               role: signRespponse.data.user.roles[0] || "",
            },
            ipAddress: "IP.address()"
         }
         const event = new AuditEvent();
         event.emit('complete', aduitPayload)
         return ApiResponse.success(response, apiStatusCodes.success, signRespponse.data, signRespponse.message)



      } catch (error) {

         return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

      }

   }

   public async addUser(request: Request, response: Response) {

      try {

         const dbResponse = await AuthServices.addUser(request.body);

         return ApiResponse.success(response, apiStatusCodes.success, dbResponse, 'user created successfully')


      } catch (error) {

         return ApiResponse.error(response, apiStatusCodes.serverError, null, error);


      }

   }

   public async getRoles(request: Request, response: Response) {

      try {

         const dbResponse = await AuthServices.getRoles();

         return ApiResponse.success(response, apiStatusCodes.success, dbResponse, 'data retrieved successfully')


      } catch (error) {

         return ApiResponse.error(response, apiStatusCodes.serverError, null, error);


      }


   }

   public async getUsers(request: Request, response: Response) {

      try {

         const dbResponse = await AuthServices.getUsers(request.query);

         return ApiResponse.success(response, apiStatusCodes.success, dbResponse, 'data retrieved successfully')


      } catch (error) {

         return ApiResponse.error(response, apiStatusCodes.serverError, null, error);


      }


   }

 
   /**
* This handles user request to reset password, and sends password reset email.
* @param {express.Request} req Express request param
* @param {express.Response} res Express response param
*/
   async requestResetPassword(req:Request, res:Response) {
      const { email } = req.body;
      const isMerchant = !validateEmail(email);

      try {
         const user = await getUser(email, isMerchant);

         if (!user) {
            return ApiResponse.send(res, apiStatusCodes.badRequest,'', {
               error: 'User does not exist.',
            });
         }

         const userEmail = user.emailAddress || user.merchant_email;

         if (!userEmail) {
            return ApiResponse.send(res, apiStatusCodes.badRequest, '',{
               error: 'No email associated with this account, contact the admin!',
            });
         }

         const emailtoken = Math.random().toString(15).substring(2);
         const message = `<b>Hello ${user.firstname}</b><br>
     <p>You requested to reset your password on ${process.env.APP_NAME}.</p>
     <p>Click on the link below to reset your password</p>
     <a href="${process.env.UI_URL}/auth/verify?email=${email}&token=${emailtoken}">
     <button style="background-color:green; color:white; padding: 3px 8px; outline:0">Reset Password</button></a>
     <p>You can copy and paste to browser.</p>
     <code>${process.env.UI_URL}/auth/verify?email=${email}&token=${emailtoken}</code>
     <p>Kindly ignore, if you didn't make the request</p><br>
     <p>${process.env.APP_NAME} &copy; ${new Date().getFullYear()}</p>`;

         sendEmailSms({ emailRecipients: [userEmail], emailBody: message, emailSubject: 'Reset Password Confirmation' });

         user.emailtoken = emailtoken;
         await user.save();

         return ApiResponse.send(res, apiStatusCodes.success,'', {
            data: {
               message: 'Check your email for password reset link.',
               email,
            },
         });
      } catch (error) {  return ApiResponse.error(res, apiStatusCodes.serverError, null, error); }
   }

   /**
   * This handles user changing a users password: with emailtoken or authenticated user token.
   * @param {express.Request} req Express request param
   * @param {express.Response} res Express response param
   */
   async resetPassword(req:Request, res:Response) {
      const { token, email, password: pass } = req.body;
      let isMerchant = !validateEmail(email);
      let user = null;

      try {
         if (token) {
            user = await getUser(email, isMerchant, { emailtoken: token });
         } else {
            // Get the logged in user from authorization in param: req
            const loggedIn = getUserFromToken(req);
            if (!loggedIn.status) {
               return ApiResponse.send(res, apiStatusCodes.unAuthorized, '', {
                  error: loggedIn.error,
               });
            }
            const uID = loggedIn?.user.emailAddress;
            isMerchant = !validateEmail(uID);
            user = await getUser(uID, isMerchant);
         }

         if (!user) {
            return ApiResponse.send(res, apiStatusCodes.badRequest,'', {
               error: 'Invalid link, kindly re-request for password reset.',
            });
         }

         const password = bcrypt.hashSync(pass, 10);
         user.password = password;
         user.emailtoken = '';
         await user.save();
         return ApiResponse.send(res, apiStatusCodes.success,'', {
            data: {
               message: 'Password changed successfully.',
               email,
            },
         });
      } catch (error) {  return ApiResponse.error(res, apiStatusCodes.serverError, null, error); }
   }

}
export const getUser = async (uId, isMerchant, filter?:any) => {
   if (typeof filter !== 'object' || !filter) filter = {};
 
   let user = null;
   user = await usersModel.findOne({ emailAddress: uId});
   // console.log("user", user)
   return user;
 };
export default AuthController;

