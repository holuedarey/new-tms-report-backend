import ApiResponse from '../../helpers/apiResponse';
import { apiStatusCodes } from '../../helpers/constants';
import Utils from '../../helpers/utils';
import { Request, Response } from 'express';
import Joi from 'joi';
import jwt, { decode } from 'jsonwebtoken';
import { createUserBulk, createUserSchema } from '../../middlewares/validators/schemas/auth.schema';
import { assignTerminals, assignTerminal } from '../../middlewares/validators/schemas/terminal.schema';

const validateStaticAuthorization = (req: Request, response: Response, next: Function) => {

    const exptecedHash = Utils.doSHA512(process.env.API_SECRET_KEY);

    const authToken = req.body.token || req.query.token
        || req.headers['x-access-token']
        || req.headers.Authorization || req.headers.authorization;

    if (!authToken)
        return ApiResponse.error(response, apiStatusCodes.badRequest, null, "Authorization header is required");


    // Authorization should be Base64(username,role,merchantcode,hash512(apikey))

    const decoded = Buffer.from(authToken, 'base64').toString('utf-8').split(',');

    if (decoded.length !== 4)
        return ApiResponse.error(response, apiStatusCodes.badRequest, null, "Invalid Authorization header");

    console.log("ExpectedHash, ", exptecedHash);
    console.log("ClientHash, ", decoded[3]);

    if (decoded[3] !== exptecedHash) {
        return ApiResponse.error(response, apiStatusCodes.badRequest, null, "Invalid Authorization header");
    }

    req.body.username = decoded[0];
    req.body.role = decoded[1];
    req.body.merchantcode = decoded[2];
    next()

}


const validateStaticAuthorizationHeader = (req: Request, response: Response, next: Function) => {

    const exptecedHash = Utils.doSHA256(process.env.API_SECRET_KEY);

    const authToken = req.body.token || req.query.token
        || req.headers['x-access-token']
        || req.headers.Authorization || req.headers.authorization;

    if (!authToken)
        return ApiResponse.error(response, apiStatusCodes.badRequest, null, "Authorization header is required");
    // Authorization should be Base64(username,role,merchantcode,hash512(apikey))
    console.log("ExpectedHash, ", Buffer.from(exptecedHash).toString('base64'));
    console.log("ClientHash, ", authToken);

    if (authToken !== Buffer.from(exptecedHash).toString('base64')) {
        return ApiResponse.error(response, apiStatusCodes.badRequest, null, "Invalid Authorization header");
    }

    next()

}

const validateRequest = (schema: object) => {
    return (req: Request, res: Response, next: Function) => {
        const { error } = Joi.validate(req.body, schema);
        const valid = error == null;

        if (valid) {
            next();
        } else {
            const { details } = error;
            const message = details.map(i => i.message).join(',');

            return ApiResponse.error(res, apiStatusCodes.badRequest, null, message);

        }
    }
}

const validateCreateUserRequest = () => {
    return (req: Request, res: Response, next: Function) => {
        let schema = req.params.method === 'single'
            ? createUserSchema
            : createUserBulk;

        const { error } = Joi.validate(req.body, schema);
        const valid = error == null;

        if (valid) {
            next();
        } else {
            const { details } = error;
            const message = details.map(i => i.message).join(',');
            return ApiResponse.error(res, apiStatusCodes.badRequest, null, message);
        }
    }
}


const validateAssignTerminalRequest = () => {
    return (req: Request, res: Response, next: Function) => {

        let schema = req.params.method === 'single'
            ? assignTerminal
            : assignTerminals;

        const { error } = Joi.validate(req.body, schema);
        const valid = error == null;

        console.log(valid);


        if (valid) {
            next();
        } else {
            const { details } = error;
            const message = details.map(i => i.message).join(',');
            return ApiResponse.error(res, apiStatusCodes.badRequest, null, message);
        }
    }
}

const verifyToken = async (req, res: Response, next: Function) => {

    const authToken = req.body.token || req.query.token
        || req.headers['x-access-token']
        || req.headers.Authorization || req.headers.authorization;

    // console.log("authToken", authToken);

    if (!authToken) {
        return ApiResponse.error(res, apiStatusCodes.unAuthorized, null, 'token must be provided');
    }
    // try {
    const decoded: any = jwt.decode(req.headers.authorization);
    // console.log(decoded);

    const expired = Date.now() >= decoded.exp * 1000;

    if (expired) {
        return ApiResponse.error(res, apiStatusCodes.unAuthorized, null, 'token has expired');
    }
    const verified = jwt.verify(req.headers.authorization, process.env.API_SECRET_KEY);

    if (!verified) {
        return ApiResponse.error(res, apiStatusCodes.unAuthorized, null, 'invalid token provided');
    }

    //   req.body.user = decoded;

    req.body.username = decoded.username;
    req.body.role = decoded.roles[0];
    req.body.merchantcode = decoded.merchantCode;
    req.user = decoded

    next();

    // } catch (error) {
    //     return ApiResponse.error(res, apiStatusCodes.serverError, null, error);
    // }
}


export {
    validateRequest, validateStaticAuthorization, validateAssignTerminalRequest,
    verifyToken, validateCreateUserRequest, validateStaticAuthorizationHeader
}

