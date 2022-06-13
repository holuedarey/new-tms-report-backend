import ApiResponse from '../helpers/apiResponse';
import { apiStatusCodes } from '../helpers/constants';
import { Request, response, Response } from 'express';
import UserServices from '../services/user.services';


class UserController {


     public async createUsers(request: Request, response: Response) 
     {

        try {
            
            const responseData = request.params.method === "single"
                ? await UserServices.createUserSingle(request.body)
                : await UserServices.createUsersBulk(request.body);


            return ApiResponse.success(response, 
                apiStatusCodes.success, responseData, "User created successfully");
            
        } catch (error) {
            
           return ApiResponse.error(response,apiStatusCodes.serverError, null, error);

        }

     }


     public async getAgentsRequest(request: Request, response: Response) {

        try {

            // const { role, page, limit } = request.query;

            const responseData = await UserServices.getOnboardedAgents(request.query);

            return ApiResponse.success(response, 
                apiStatusCodes.success, 
                responseData, 
                `Data retrieved successfully`);
            
            
        } catch (error) {

           return ApiResponse.error(response,apiStatusCodes.serverError, null, error);
            
        }

     }

     public async activateDeactvateAgent(request: Request, response: Response) {

        try {

            const { isApproved, email } = request.body;

            const activateAgentResponse = await UserServices.activateAgent(isApproved, email);

            const messageAction = isApproved === true ? 'activated' : 'deactivated'

            if(!activateAgentResponse) {
               return ApiResponse.error(response, apiStatusCodes.badRequest, null, 'Could not activate/deactivate user, invalid profile');
            }
            
            return ApiResponse.success(response, apiStatusCodes.success, 
                null, 
                `Agent was successfully ${messageAction}`);
            
        } catch (error) {

            return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
            
        }

     }


     public async getUsersInRole(request: Request, response: Response) 
     {
        try {

            const { role, page, limit } = request.query;

            const responseData = await UserServices.getUsersInRole(role, page, limit);

            return ApiResponse.success(response, 
                apiStatusCodes.success, responseData, `Data retrieved for users in ${role} role`);
            
        } catch (error) {
            
           return ApiResponse.error(response,apiStatusCodes.serverError, null, error);

        }
     }

     public async getUserDetails(request: Request, response: Response) 
     {
        try {
            
            const userDetails = await UserServices.getUserDetails(request.params.username);

            return ApiResponse.success(response, apiStatusCodes.success, userDetails, "Data Retrieved");

        } catch (error) {
            
           return ApiResponse.error(response,apiStatusCodes.serverError, null, error);

        }
     }


     public async getRoles(request: Request, response: Response) 
     {
         try {

            
            const responseData = await UserServices.getRoles();

            return ApiResponse.success(response, 
                apiStatusCodes.success, responseData, `Data retrieved all available role`);
            
             
         } catch (error) {

           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
             
         }

     }

     public async addUserToRole(request: Request, response: Response) {

         try {

            const responseData: any = await UserServices.addToUserRole(request.params.username,
                request.body.newRole);
            
            if(responseData.error === true) {

               return ApiResponse.success(response, 
                  apiStatusCodes.success, null, responseData.message);

            }

            return ApiResponse.success(response, 
                apiStatusCodes.success, null, 'Successfully updated user');
            
            
         } catch (error) {

           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

         }

     }


     public async removeUserRole(request: Request, response: Response) {

      try {

         const responseData: any = await UserServices.removeUserRole(request.params.username,
             request.body.newRole);
         
         if(responseData.error === true) {

            return ApiResponse.success(response, 
               apiStatusCodes.success, null, responseData.message);

         }

         return ApiResponse.success(response, 
             apiStatusCodes.success, responseData.data, 'Successfully removed role from user');
         
         
      } catch (error) {

        return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

      }

     }


     public async getWalletMainBalance(request: Request, response: Response) {
       // try {
            
        

        const isMain = request.url.toLowerCase().includes('main')
        const { walletId } = request.query; 
        // @ts-ignore
        const responseData: any = await UserServices.getWalletBalance(isMain , walletId);

        // if(responseData.error === true) {
        //     return ApiResponse.success(response, 
        //        apiStatusCodes.success, null, responseData.message);
        // }

        console.log(responseData)

        return response.json(responseData.data);
             
        // } catch (error) {

        //     return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
            
        // }
     }

}

export default UserController;