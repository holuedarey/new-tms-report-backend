import { Request, Response } from 'express';
import AuthServices from '../services/auth.services';
import ApiResponse from '../helpers/apiResponse';
import { apiStatusCodes } from '../helpers/constants';
import logger from '../helpers/logger';
import AuditEvent from '../events/audits.events';
import { AuditEventResources, AuditActionResources } from '../db/model/audit.model';


class AuthController {

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

   public async activatePaysureAgentOnTms(request: Request, response: Response) {

   }
}

export default AuthController;

