import { Response } from 'express';
import Logger from './logger';
import { apiStatusCodes } from './constants';

class ApiResponse {
    success(res: Response, status: number, data: any, message: string) {
        return res.status(apiStatusCodes.httpSuccess).json({
            responseCode: status,
            responseMessage: message,
            data
        });
    }

    send(res: Response, status: number, message: string, data: any = null) {

        let httpStatus = status === apiStatusCodes.serverError 
        ? apiStatusCodes.httpserverError 
        : status;

        if(httpStatus === 0) httpStatus = apiStatusCodes.httpSuccess;

        // console.log(htt)
        res.status(httpStatus).send({
            responseCode: status,
            responseMessage: message,
            data,
        });
    }

    error(res: Response, code: number, error: any = {}, message: string, ) {
        Logger.log(error);
        if (code === parseInt('444')) {
            return this.send(res, apiStatusCodes.badRequest, error.message);
        }

        if (code === apiStatusCodes.badRequest || code === apiStatusCodes.forbidden) {
            return res.status(apiStatusCodes.badRequest).json({
                responseCode: code,
                responseMessage: message,
                data: error,
            });
        }

        
        return this.send(res, code, message, error);
    }
}

export default new ApiResponse();