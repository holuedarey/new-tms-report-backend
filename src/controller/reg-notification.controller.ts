import { Request, Response } from 'express';
import regnotificationServices from '../services/reg-notification.services';
import ApiResponse from '../helpers/apiResponse';
import { apiStatusCodes } from '../helpers/constants';
import webServices from '../services/web.services';


class RegNotificationController {

    constructor() {

    }

    public async AddService(request: Request, response: Response) {

        try {

            const responseData = await regnotificationServices.AddService(request.body);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Operation successfully completed");

        } catch (error) {

           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);

        }

    }

    public async UpdateService(request: Request, response: Response) {

        try {

            const responseData = await regnotificationServices.UpdateService(request.params.notificationId, request.body);

            if(responseData.err) return ApiResponse.error(response, apiStatusCodes.notFound, null, 'Service not Found');

            return ApiResponse.success(response, apiStatusCodes.success, responseData.data, "Operation successfully completed");

        } catch (error) {

           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);

        }

    }

    public async DeleteService(request: Request, response: Response) {

        try {
            
            const responseData = await regnotificationServices.DeleteService(request.params.notificationId);

            if(responseData.err) return ApiResponse.error(response, apiStatusCodes.notFound, null, 'Service not Found');

            return ApiResponse.success(response, apiStatusCodes.success, responseData.data, "Operation successfully completed");


        } catch (error) {

           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);

        }

    }

    public async GetServiceById(request: Request, response: Response) {

        try {
            const { notificationId} = request.params

            const responseData = await regnotificationServices.getOneService(notificationId);

            if(responseData.err) return ApiResponse.error(response, apiStatusCodes.notFound, null, 'Service not Found');

            return ApiResponse.success(response, apiStatusCodes.success, responseData.data, "Data successfully retrieved");

        } catch (error) {

           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);

            
        }
    }

    public async GetServices(request: Request, response: Response) {

        try {
            

            const responseData = await regnotificationServices.getServices(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");

        } catch (error) {
            
           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);
            
        }

    }

    public async SearchNotifications(request: Request, response: Response) {
        try {
            const responseData = await regnotificationServices.SearchNotifications(request.query.name);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");

        }catch(error){
            return ApiResponse.error(response, apiStatusCodes.serverError, null,error);
        }
    }


}

export default RegNotificationController;