import { Request, Response } from 'express';
import bankServices from '../services/bank.services';
import ApiResponse from '../helpers/apiResponse';
import { apiStatusCodes } from '../helpers/constants';
import webServices from '../services/web.services';


class BankController {


    public async getDeclinedOrApprovedSummary(request: Request, response: Response) {

        try {
            
            const responseData = await bankServices.getDeclinedOrApprovedSummary(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data retrieved successfully");

        } catch (error) {
            
           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);

        }

    }

    public async getDeclinedOrApprovedSummaryTotalBankCount(request: Request, response: Response) {

        try {
            
            const responseData = await bankServices.getDeclinedOrApprovedSummaryTotalBankCount(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data retrieved successfully");

        } catch (error) {

           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);

        }

    }

    public async getDeclinedOrApprovedStatusSummary(request: Request, response: Response) {

        try {

            const responseData = await bankServices.getDeclinedOrApprovedStatusSummary(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data retrieved successfully");

        } catch (error) {
            
           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);

            
        }
    }


    public async getBanksBehaviouralPatternWithStatus(request: Request, response: Response) {

        try {

            const responseData = await bankServices.banksBehaviouralPatternWithStatus(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data retrieved successfully");

        } catch (error) {
            
           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);
        }

    }

    public async getBankTransactionWithStatusPercentage(request: Request, response: Response) {

        try {

            const responseData = await bankServices.bankTransactionWithStatusPercentage(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data retrieved successfully");

        } catch (error) {
            
           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);
        }

    }

    public async getBankTransactionWithCardSchemePercentage(request: Request, response: Response) { 

        try {

            const responseData = await bankServices.bankTransactionWithCardSchemePercentage(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data retrieved successfully");

        } catch (error) {
            
           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);
        }
    }

    public async getBankTransactionWithCardSchemePercentageWithFailandApproved(request: Request, response: Response) { 

        try {

            const responseData = await bankServices.bankTransactionWithCardSchemePercentageWithFailandApproved(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data retrieved successfully");

        } catch (error) {
            
           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);
        }
    }  

    public async getLeastBanksSummary(request: Request, response: Response) {


        try {

            const responseData = await bankServices.getLeastBanksSummary(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data retrieved successfully");

        } catch (error) {
            
           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);
        }

    }

    public async generateReportByWeekOrMonth(request: Request, response: Response) {

        try {

            const responseData = await bankServices.generateReportByWeekOrMonth(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data retrieved successfully");

        } catch (error) {
            
           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);
        }

    }


    public async getTopBanksSummary(request: Request, response: Response) {

        try {

            const responseData = await bankServices.getTopBanksSummary(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data retrieved successfully");

        } catch (error) {
            
           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);
        }

    }


    public async getAllBanks(request: Request, response: Response) {

        try {

            const responseData = await bankServices.getAllBanks();

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data retrieved successfully");

        } catch (error) {
            
           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);
        }

    }


    public async getTopError(request: Request, response: Response) {

        try {

            const responseData = await bankServices.getTopError(request.query);

            return ApiResponse.success(response, apiStatusCodes.success, responseData, "Data retrieved successfully");

        } catch (error) {
            
           return ApiResponse.error(response, apiStatusCodes.serverError, null,error);
        }

    }






}

export default BankController;