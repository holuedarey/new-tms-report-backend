import { Request, Response } from 'express';
import terminalServices from '../services/terminal.services';
import ApiResponse from '../helpers/apiResponse';
import { apiStatusCodes } from '../helpers/constants';
import webServices from '../services/web.services';
import userServices from '../services/user.services';

class TerminalController {

    constructor() { }

    public async getTerminalUnassignedToWallet(request: Request, response: Response) {

        const terminalDetails: any= await terminalServices.getAllTerminalsByMerchantCodeNotAssignedToWallet(request.params.merchantCode, request.query);

        if(terminalDetails === null) return ApiResponse.error(response, apiStatusCodes.badRequest, null, "Could not retreive data");

        return ApiResponse.success(response, apiStatusCodes.success, terminalDetails, "Data Retrieved");
    }

    public async getTerminalByTerminalId(request: Request, response: Response) {

        const terminalDetails: any= await terminalServices.getTerminalByTerminalId(request.params.terminalId);

        if(!terminalDetails) return ApiResponse.error(response, apiStatusCodes.badRequest, null, "Could not fetch terminal detail");

        return ApiResponse.success(response, apiStatusCodes.success, terminalDetails, "Data Retrieved");
    }

    public async getTerminalBySerialNumber(request: Request, response: Response) {

        const terminalDetails: any= await terminalServices.getTerminalBySerialNumber(request.params.serialNumber);

        if(!terminalDetails) return ApiResponse.error(response, apiStatusCodes.badRequest, null, "Could not fetch terminal detail");

        return ApiResponse.success(response, apiStatusCodes.success, terminalDetails, "Data Retrieved");
    }


    public async getActiveAndInactiveSummaryByMerchantCodeandWalletId(request: Request, response: Response) {

        try {

            const queryParams: any = request.query;

            const summary = queryParams.summary === "true";

            const terminalDetails: any = await terminalServices.getActiveAndInactiveSummaryByMerchantCodeandWalletId(request.params.merchantCode, 
                queryParams.walletId, summary);

            if(!terminalDetails) return ApiResponse.error(response, apiStatusCodes.badRequest, null, "Could not fetch terminals mapped to walletId");

            return ApiResponse.success(response, apiStatusCodes.success, terminalDetails, "Data Retrieved");

        } catch (error) {

           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

            
        }


    }


    public async getTerminalsByMerchantCodeAndWalletId(request: Request, response: Response) {

       try {

            const queryParams: any = request.query;

            const terminalDetails: any= await terminalServices.getAllTerminalsByMerchantCode(request.params.merchantCode, queryParams);

            if(!terminalDetails) return ApiResponse.error(response, apiStatusCodes.badRequest, null, "Could not fetch terminals mapped to walletId");

            const summary = queryParams.terminalId 
                ? undefined
                : await terminalServices.getActiveAndInactiveSummaryByMerchantCodeandWalletId(request.params.merchantCode,
                    queryParams, true)

            return ApiResponse.success(response, apiStatusCodes.success, { summary, terminalDetails}, "Data Retrieved");

        } catch (error) {

           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

        }

    }

    public async getTerminalDetails(request: Request, response: Response) 
    {
        try {

            const queryParams: any = request.query;
            const terminalDetails: any = request.query["byTerminal"] && request.query["byTerminal"] === 'true' 
            ? await terminalServices.getTerminalByTerminalId(request.params.serialNumber)
            : await terminalServices.getTerminalBySerialNumberandMerchantCode(request.params.serialNumber, queryParams.merchantCode);

            if(!terminalDetails) return ApiResponse.error(response, apiStatusCodes.badRequest, null, "Could not fetch terminal detail");

            const hostDetails = request.query["byTerminal"] && request.query["byTerminal"] === 'true' 
            ? undefined 
            : await terminalServices.getHostConfigByHostName(terminalDetails.primaryHost);

            let agentDetails = null;

            if (terminalDetails.walletId !== null || terminalDetails.walletId !== "") {

                agentDetails = await userServices.getUserByWalletId(terminalDetails.walletId);
    
            }

            const responseData = { hostDetails, terminalDetails, agentDetails };
            // return response.json({error: false, message: "mdhdh"})

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data Retrieved");

        } catch (error) {

           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

        }
    }

    public async assignTerminal(request: Request, response: Response) 
    {

        //try {

            const queryParams: any = request.query;
            
            const responseData = request.params.method === 'single' 
                ? await terminalServices.assignTerminalSingle(request.body, queryParams.merchantCode) 
                : await terminalServices.assignTerminalBulk(request.body, queryParams.merchantCode); 
                
            // console.log(responseData);  

            if(!responseData) return ApiResponse.error(response, apiStatusCodes.badRequest, null, "Could not assign terminal Successfully");
                
            // if(responseData && queryParams.merchantCode) {

            //     const terminals = Array.isArray(request.body) ? request.body : [request.body];

            //     await webServices.addTerminalByMerchantCode(queryParams.merchantCode, terminals);

            // }
            
            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data Processed");

        // } catch (error) {
            
        //    return ApiResponse.error(response, apiStatusCodes.serverError, null, error);

        // }

    }


    public async assignTerminalToWalletId(request: Request, response: Response) {
        try 
        {


            const responseData = await terminalServices.updateTerminalSingleWithWalletId(request.body.serialNumbers, request.body.walletId);

            if(!responseData) {
               
                return ApiResponse.error(response, apiStatusCodes.serverError , null, 'An error occured please retry');
            }

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully updated");

        } catch(error) 
        {

           return ApiResponse.error(response, apiStatusCodes.serverError , error, error.message);

        } 


    }

    public async updateTerminal(request: Request, response: Response) 
    {
        try 
        {
            const responseData = await terminalServices.updateTerminalSingle(request.body, request.params, request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData , "Data successfully updated");

        } catch(error) 
        {
           return ApiResponse.error(response, apiStatusCodes.serverError , null, error.message);

        } 
    }

    public async deleteTerminal(request: Request, response: Response) 
    {
        try 
        {
            const responseData = await terminalServices.deleteTerminal(request.params.serialNumber);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully deleted");
            
        } catch (error) 
        {
           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
        }
    }

    public async enableordisableTerminal(request: Request, response: Response) 
    {
        try 
        {
            const responseData = await terminalServices.enableordisableTerminal(request.params.serialNumber, request.params.action);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully deleted");
            
        } catch (error) 
        {
         
           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);
            
        }

    }

    public async getHealthCheckPatternForTerminals(request: Request, response: Response) 
    {
        try 
        {
            const responseData = await terminalServices.getHealthCheckPatternForTerminals(request.params.merchantcode, request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");

        } catch (error) 
        {
           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);
        }

    }

    public async getTerminalLocationPatternTerminals(request: Request, response: Response) 
    {
        try 
        {
            const responseData = await terminalServices.getTerminalLocationPatternTerminals(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");

        } catch (error) 
        {
           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
        }

    }

    public async getActiveInactiveCountReports(request: Request, response: Response) 
    {
        try 
        {

            const responseData = await terminalServices.getActiveInactiveCountReports(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");
            
        } catch (error) 
        {
           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
        }

    }

    public async getActiveInactiveVolumeReports(request: Request, response: Response) 
    {
        try 
        {

            const responseData = await terminalServices.getActiveInactiveVolumeReports(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");
            
        } catch (error) 
        {
           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
        }

    }

    public async getlast2DaysActiveTerminalsReport(request: Request, response: Response) 
    {
        try 
        {

            const responseData = await terminalServices.getlast2DaysActiveTerminalsReport(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");
            
        } catch (error) 
        {
           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
        }

    }

    public async getlast2DaysActiveTerminals(request: Request, response: Response) 
    {
        try 
        {

            const responseData = await terminalServices.getlast2DaysActiveTerminals(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");
            
        } catch (error) 
        {
           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
        }

    }

    public async getPrinterStatusCount(request: Request, response: Response) 
    {
        try 
        {

            const responseData = await terminalServices.getPrinterStatusCount(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");
            
        } catch (error) 
        {
           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
        }

    }

    public async getPrinterStatusReports(request: Request, response: Response) {
        try {

            const responseData = await terminalServices.getPrinterStatusReports(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");
            
        } catch (error) 
        {
           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
        }

    }

    public async getSignalStatusCount(request: Request, response: Response) 
    {
        try 
        {

            const responseData = await terminalServices.getSignalStatusCount(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");
            
        } catch (error) 
        {
           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
        }

    }

    public async getSignalStatusReport(request: Request, response: Response) 
    {
        try 
        {

            const responseData = await terminalServices.getSignalStatusReport(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");
            
        } catch (error) 
        {
           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
        }

    }

    public async getBatteryLevelCount(request: Request, response: Response) {
        try 
{
            console.log(request.body);

            const responseData = await terminalServices.getBatteryLevelCount(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");
            
        } catch (error) 
        {
           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
        }

    }

    public async getBatteryLevelReport(request: Request, response: Response) {
        try {

            console.log(request.body);

            const responseData = await terminalServices.getBatteryLevelReport(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");
            
        } catch (error) 
        {
           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
        }

    }

    public async getTerminalsStates(request: Request, response: Response) 
    {
        try 
        {
            const responseData = await terminalServices.getTerminalsStates(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");
            
        } catch (error) 
        {
           return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
        }

    }
    public async getArchivedTerminals(request: Request, response: Response){
        try{
            const responseData = await terminalServices.getArchivedTerminals(request.query);
  
            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data successfully retrieved");
            
        }catch(error){
            return ApiResponse.error(response, apiStatusCodes.serverError, null, error);
        }
    }



}


export default TerminalController;