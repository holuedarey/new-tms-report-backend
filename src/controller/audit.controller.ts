import { Request, Response } from 'express';
import AuditTrailService from '../services/auditTrail.services';
import ApiResponse from '../helpers/apiResponse';
import { apiStatusCodes } from '../helpers/constants';


class AuditController {
   public async getAuditTrails(request: Request, response: Response) {
      try {

         const { role, page, limit, startDate, endDate, search, email, permissions, approval } = request.query;

         const userServ =  new AuditTrailService()
         const responseData = await userServ
         .setLimit(limit)
         .setPage(page)
         .setDate(startDate, endDate)
         .setSearch(search)
         .setUserEmail(email)
         .setRoles(role)
         .getAudits();

         return ApiResponse.success(response,
            apiStatusCodes.success, responseData.rows, `Data retrieved successfully`);

      } catch (error) {

         return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

      }
   }

}

export default AuditController;

