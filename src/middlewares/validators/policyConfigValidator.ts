import jwt from 'jsonwebtoken';
import ApiResponse from '../../helpers/apiResponse';
import { apiStatusCodes } from '../../helpers/constants';
import { Request, Response } from 'express';


class PolicyConfigValidations {

  public async isAgent(req: Request, res: Response, next: Function) {
    const authToken: any = jwt.verify(req.headers.authorization, process.env.API_SECRET_KEY);

    if(authToken.roles.includes("agent")) {
        next()
    }
    return ApiResponse.error(res, apiStatusCodes.forbidden, null, "Resource Restricted to only Agents");

  }

  public async isAdmin(req: Request, res: Response, next: Function) {
    if(!req.user.roles.includes("admin")) {
        return ApiResponse.error(res, apiStatusCodes.forbidden, null,"Resource Restricted to only Admin");
    }         
    
    next()
  }


  public async isB2b(req: Request, res: Response, next: Function) {
    const authToken: any = jwt.verify(req.headers.authorization, process.env.API_SECRET_KEY);

    if(authToken.roles.includes("b2b")) {
      return next()
    }

    if(authToken.roles.includes("admin")) {
      return next()
    }
    

    console.log("herehere")
    return ApiResponse.error(res, apiStatusCodes.forbidden, null,"Resource Restricted to only Admin/B2B");
    
    

  }

  public async isSuperAdmin(req: Request, res: Response, next: Function) {
    const authToken: any = jwt.verify(req.headers.authorization, process.env.API_SECRET_KEY);

    if(authToken.roles.includes("superadmin")) {
        next()
    }
    return ApiResponse.error(res, apiStatusCodes.forbidden, null, "Resource Restricted to only SuperAdmin");

  }

  public async isMerchant(req: Request, res: Response, next: Function) {
    const authToken: any = jwt.verify(req.headers.authorization, process.env.API_SECRET_KEY);

    if(authToken.roles.includes("merchant")) {
        next()
    }
    return ApiResponse.error(res, apiStatusCodes.forbidden, null, "Resource Restricted to only Merchant");

  }

  public async isSupport(req: Request, res: Response, next: Function) {
    const authToken: any = jwt.verify(req.headers.authorization, process.env.API_SECRET_KEY);

    if(authToken.roles.includes("support")) {
        next()
    }
    return ApiResponse.error(res, apiStatusCodes.forbidden, null,"Resource Restricted to only Support");

  }
}

export default new PolicyConfigValidations();
