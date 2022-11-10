import ApiResponse from '../helpers/apiResponse';
import { apiStatusCodes } from '../helpers/constants';
import { Request, response, Response } from 'express';
import UserServices from '../services/user.services';
import { AuditEventResources, AuditActionResources } from '../db/model/audit.model';

// const IP = require('ip');
import AuditEvent from '../events/audits.events';
import { IUserToken } from '../interfaces/db.models';

class UserController {

   public AuditEvent;
   constructor() {
      this.AuditEvent = new AuditEvent();
   }

   public async createUsers(request: Request, response: Response) {
      try {

         const userServ =  new UserServices();
         const responseData = request.params.method === "single"
            ? await userServ.createUserSingle(request.body)
            : await userServ.createUsersBulk(request.body);
            
         const ts_hms = new Date().toISOString();
         const aduitPayload = {
            auditActivity: AuditEventResources.UsersView,
            auditType: AuditActionResources.UsersCreate,
            description: `${request.user.emailAddress} create a new user @ ${ts_hms}`,
            user: {
               name: request.user.name || "",
               email: request.user.emailAddress,
               role: request.user.roles[0] || "",
            },
            ipAddress: "IP.address()"
         }
         const event = new AuditEvent();
         event.emit('complete', aduitPayload)
         return ApiResponse.success(response,
            apiStatusCodes.success, responseData, "User created successfully");

      } catch (error) {

         return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

      }

   }


   public async getAgentsRequest(request: Request, response: Response) {

      try {

         // const { role, page, limit } = request.query;
         const userServ =  new UserServices()
         const responseData = await userServ.getOnboardedAgents(request.query);

         return ApiResponse.success(response,
            apiStatusCodes.success,
            responseData,
            `Data retrieved successfully`);


      } catch (error) {

         return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

      }

   }

   public async activateDeactvateUser(request: Request, response: Response) {

      try {

         const { isApproved, email } = request.body;

         const userServ =  new UserServices()
         const activateAgentResponse = await userServ.activateAgent(email) as IUserToken;
         console.log(activateAgentResponse)
         const messageAction = activateAgentResponse.isApproved === true ? 'activated' : 'deactivated'

         if (!activateAgentResponse) {
            return ApiResponse.error(response, apiStatusCodes.badRequest, null, 'Could not activate/deactivate user, invalid profile');
         }

         const ts_hms = new Date().toISOString();
         const aduitPayload = {
            auditActivity: AuditEventResources.UsersView,
            auditType: AuditActionResources.UsersActivate,
            description: `${request.user.emailAddress} update a new user @ ${ts_hms}`,
            user: {
               name: request.user.name || "",
               email: request.user.emailAddress,
               role: request.user.roles[0] || "",
            },
            ipAddress: "IP.address()"
         }
         const event = new AuditEvent();
         event.emit('complete', aduitPayload)
         return ApiResponse.success(response, apiStatusCodes.success,
            null,
            `Agent was successfully ${messageAction}`);

      } catch (error) {

         return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

      }

   }


   public async getUsersInRole(request: Request, response: Response) {
      try {

         const { role, page, limit, startDate, endDate, search, email, permissions, approval } = request.query;

         const userServ =  new UserServices()
         const responseData = await userServ
         .setLimit(limit)
         .setPage(page)
         .setDate(startDate, endDate)
         .setSearch(search)
         .setUserEmail(email)
         .setRoles(role)
         .setApproved(approval)
         .setPermissions(permissions)
         .getUsersInRole();

         return ApiResponse.success(response,
            apiStatusCodes.success, responseData, `Data retrieved successfully`);

      } catch (error) {

         return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

      }
   }

   public async getUserSummary(request: Request, response: Response) {
      try {

         const { role, page, limit, startDate, endDate, search, email, permissions, approval } = request.query;

         const userServ =  new UserServices()
         const responseData = await userServ
         .userSummary();

         return ApiResponse.success(response,
            apiStatusCodes.success, responseData.rows, `Data retrieved successfully`);

      } catch (error) {

         return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

      }
   }

   public async getUserDetails(request: Request, response: Response) {
      try {

         const userServ =  new UserServices()
         const userDetails = await userServ.getUserDetails(request.params.username);

         return ApiResponse.success(response, apiStatusCodes.success, userDetails, "Data Retrieved");

      } catch (error) {

         return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

      }
   }


   public async getRoles(request: Request, response: Response) {
      try {
         const userServ =  new UserServices()
         const responseData = await userServ.getRoles();

         return ApiResponse.success(response,
            apiStatusCodes.success, responseData, `Data retrieved all available role`);


      } catch (error) {

         return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

      }

   }

   public async addUserToRole(request: Request, response: Response) {

      try {

         const userServ =  new UserServices();
         const responseData: any = await userServ.addToUserRole(request.params.username,
            request.body.newRole);

         if (responseData.error === true) {

            return ApiResponse.success(response,
               apiStatusCodes.success, null, responseData.message);

         }

         const ts_hms = new Date().toISOString();
         const aduitPayload = {
            auditActivity: AuditEventResources.UsersView,
            auditType: AuditActionResources.UsersUpdate,
            description: `${request.user.emailAddress} update a new user @ ${ts_hms}`,
            user: {
               name: request.user.name || "",
               email: request.user.emailAddress,
               role: request.user.roles[0] || "",
            },
            ipAddress: "IP.address()"
         }
         const event = new AuditEvent();
         event.emit('complete', aduitPayload)
         return ApiResponse.success(response,
            apiStatusCodes.success, null, 'Successfully updated user');


      } catch (error) {

         return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

      }

   }


   public async removeUserRole(request: Request, response: Response) {

      try {

         const userServ =  new UserServices();
         const responseData: any = await userServ.removeUserRole(request.params.username,
            request.body.newRole);

         if (responseData.error === true) {

            return ApiResponse.success(response,
               apiStatusCodes.success, null, responseData.message);

         }

         const ts_hms = new Date().toISOString();
         const aduitPayload = {
            auditActivity: AuditEventResources.UsersView,
            auditType: AuditActionResources.UsersUpdate,
            description: `${request.user.emailAddress} update a new user @ ${ts_hms}`,
            user: {
               name: request.user.name || "",
               email: request.user.emailAddress,
               role: request.user.roles[0] || "",
            },
            ipAddress: "IP.address()"
         }
         const event = new AuditEvent();
         event.emit('complete', aduitPayload)

         return ApiResponse.success(response,
            apiStatusCodes.success, responseData.data, 'Successfully removed role from user');


      } catch (error) {

         return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

      }

   }



}

export default UserController;