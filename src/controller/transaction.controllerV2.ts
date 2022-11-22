import { Request, Response } from "express";
import transactionServices from "../services/transaction.servicesV2";
import ApiResponse from "../helpers/apiResponse";
import { apiStatusCodes } from "../helpers/constants";

class TransactionController {
  constructor() {}

  public async getTransactionRequery(request: Request, response: Response) {
    try {
      const responseData = await transactionServices.getTransaction(
        request.query
      );
      return ApiResponse.success(
        response,
        apiStatusCodes.success,
        responseData,
        "Data successfully retrieved"
      );
    } catch (error) {
      return ApiResponse.error(
        response,
        apiStatusCodes.serverError,
        null,
        error
      );
    }
  }

  public async getTransactions(request: Request, response: Response) {
    console.log("got here");

    try {
      const responseData = await transactionServices.getTransactions(
        request.query
      );
      return ApiResponse.success(
        response,
        apiStatusCodes.success,
        responseData,
        "Data successfully retrieved"
      );
    } catch (error) {
      return ApiResponse.error(
        response,
        apiStatusCodes.serverError,
        null,
        error
      );
    }
  }

  public async getTransactionsTLM(request: Request, response: Response) {
    try {
      const { type } = request.params;

      let data =
        type === "tlm"
          ? await transactionServices.getTransactionsTlm(request.query)
          : type === "rrn"
          ? await transactionServices.getTransactionsRRN(request.query)
          : await transactionServices.getVasTransactions(request.query);

      return ApiResponse.success(
        response,
        apiStatusCodes.success,
        data,
        "Data successfully retrieved"
      );
    } catch (error) {
      return ApiResponse.error(
        response,
        apiStatusCodes.serverError,
        null,
        error
      );
    }
  }

  public async generateFileTlm(request: Request, response: Response) {
    try {
      let data = await transactionServices.getQueryTotalForDownload(
        request.query
      );

      if (!data)
        return ApiResponse.error(
          response,
          apiStatusCodes.badRequest,
          null,
          "Unable to generate report file for query"
        );

      ApiResponse.success(
        response,
        apiStatusCodes.success,
        data,
        "Data successfully retrieved"
      );

      transactionServices
        .generateReportTlm(request.query, true, data.total, data.filename)
        .then((data) => {
          console.log(data);
        });
    } catch (error) {
      return ApiResponse.error(
        response,
        apiStatusCodes.serverError,
        null,
        error
      );
    }
  }

  public async getGeneratedFile(request: Request, response: Response) {
    try {
      let body = request.query;

      let data = await transactionServices.getGeneratedFile(body);

      if (!data) {
        return ApiResponse.error(
          response,
          apiStatusCodes.notFound,
          null,
          "Could not find requested resource"
        );
      }

      if (data == "pending") {
        return ApiResponse.error(
          response,
          apiStatusCodes.success,
          null,
          "Requested file is pending for download"
        );
      }

      return response.download(data);
    } catch (error) {
      return ApiResponse.error(
        response,
        apiStatusCodes.serverError,
        null,
        error
      );
    }
  }
}

export default TransactionController;
