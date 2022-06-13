
import ApiResponse from '../helpers/apiResponse';
import { Request, Response } from 'express';
import { apiStatusCodes } from '../helpers/constants';
import utils from '../helpers/utils';

// import Logger from '../helpers/Logger';

const extractCSVData = async (request: Request, response: Response, next: Function) => {

    if(request.params.method !== 'single') {

        if (request.file === undefined) {
            
            return ApiResponse.error(response, apiStatusCodes.badRequest, null, 'No file uploaded');

        }

        const csvdata = await utils.convertCSVDataToJson(request.file.path);

        request.body = csvdata;
    }


    next();


}

export { extractCSVData };