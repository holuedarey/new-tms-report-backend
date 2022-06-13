import { Request, Response } from 'express';
import notificationServices from '../services/notification.services';
import ApiResponse from '../helpers/apiResponse';
import { apiStatusCodes } from '../helpers/constants';
import webServices from '../services/web.services';


class NotificationController {

    constructor() {
    }

    public async AddService(request: Request, response: Response) {

        try {

            const responseData = await notificationServices.AddService(request.body);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Operation successfully completed");

        } catch (error) {

            return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

        }

    }

    public async UpdateService(request: Request, response: Response) {

        try {

            const responseData = await notificationServices.UpdateService(request.params.notificationId, request.body);

            if (responseData.err) return ApiResponse.error(response, apiStatusCodes.notFound, null, 'Service not Found');

            return ApiResponse.success(response, apiStatusCodes.success, responseData.data, "Operation successfully completed");

        } catch (error) {

            return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

        }

    }

    public async DeleteService(request: Request, response: Response) {

        try {

            const responseData = await notificationServices.DeleteService(request.params.notificationId);

            if (responseData.err) return ApiResponse.error(response, apiStatusCodes.notFound, null, 'Service not Found');

            return ApiResponse.success(response, apiStatusCodes.success, responseData.data, "Operation successfully completed");


        } catch (error) {

            return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

        }

    }

    public async GetServiceById(request: Request, response: Response) {

        try {

            const responseData = await notificationServices.getOneService(request.params.notificationId);

            if (responseData.err) return ApiResponse.error(response, apiStatusCodes.notFound, null, 'Service not Found');

            return ApiResponse.success(response, apiStatusCodes.success, responseData.data, "Data successfully retrieved");

        } catch (error) {

            return ApiResponse.error(response, apiStatusCodes.serverError, null, error);


        }
    }

    public async GetNotification(request: Request, response: Response) {

        try {

            console.log("hehrere------")

            const responseData = await notificationServices.getServices(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");

        } catch (error) {

            return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

        }

    }
    public async SearchServices(request: Request, response: Response) {

        try {


            const responseData = await notificationServices.SearchNotifications(request.query.name);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");

        } catch (error) {

            return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

        }
    }

    public async UploadServices(request: Request, response: Response) {

        try {

            const responseData = await notificationServices.BulkUpload();

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");

        } catch (error) {

            return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

        }
    }



}

export default NotificationController;