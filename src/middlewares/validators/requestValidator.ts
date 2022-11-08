import ApiResponse from '../../helpers/apiResponse';
import { apiStatusCodes } from '../../helpers/constants';
import Utils from '../../helpers/utils';
import { Request, Response } from 'express';
import Joi, { boolean } from 'joi';
import { createUserBulk, createUserSchema } from '../../middlewares/validators/schemas/auth.schema';
import { assignTerminals, assignTerminal } from '../../middlewares/validators/schemas/terminal.schema';
import usersModel from '../../db/model/users.model';
import TokenUtil from '../../helpers/TokenUtil';
import { IUserToken } from '../../interfaces/db.models';

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
            console.log("error", details)
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


/**
 * Decodes token to user
 * @param {Request | String} req
 * @param {Boolean} isReq
 */
const getUserFromToken = (req, isReq = true) => {
    let token = isReq ? req.headers.authorization || req.cookies.authorization || req.headers['x-access-token']
        || req.headers.Authorization || req.headers.authorization : req;
    token = `${token || ''}`.split(' ')[1] || token;

    if (!token) {
        return {
            status: false,
            error: 'Authorization is required.',
        };
    }

    const user = TokenUtil.verify(token) as IUserToken;
    if (!user) {
        return {
            status: false,
            error: 'Provided authorization is invalid or has expired.',
            token,
        };
    }

    return { status: true, user };
};


/**
 * Checks if user is authenticated
 * @param {Request} req
 * @param {Response} res
 * @param {*} next
 */
const verifyToken = async (req: Request, res: Response, next: Function) => {
    try {
        const theUser = getUserFromToken(req);


        if (!theUser.status) {
            return ApiResponse.send(res, apiStatusCodes.unAuthorized, 'Unauthorized', { error: theUser.error });
        }

        const { user } = theUser;
        const tokenExpiresAt = user?.exp;
        delete user?.iat;
        delete user?.exp;

        const tokenExpiresIn = tokenExpiresAt * 1000 - new Date().getTime();
        if (tokenExpiresIn < 20 * 60 * 1000) {
            const token = TokenUtil.sign(user);
        }

        req.user = user;
        return next();
    } catch (error) { return ApiResponse.error(res, apiStatusCodes.serverError, error, 'Internal Server Error!'); }
};

// const verifyToken = async (req: Request, res: Response, next: Function) => {


//     const authToken = req.body.token || req.query.token
//         || req.headers['x-access-token']
//         || req.headers.Authorization || req.headers.authorization;

//     console.log("theToken", authToken)
//     if (!authToken) {
//         return ApiResponse.error(res, apiStatusCodes.unAuthorized, null, 'token must be provided');
//     }
//     // try {
//     const decoded: any = jwt.decode(authToken);
//     console.log("decoded  token", decoded)
//     const expired = Date.now() >= decoded.exp * 1000;

//     if (expired) {
//         return ApiResponse.error(res, apiStatusCodes.unAuthorized, null, 'token has expired');
//     }
//     const verified = jwt.verify(authToken, process.env.API_SECRET_KEY);
//     if (!verified) {
//         return ApiResponse.error(res, apiStatusCodes.unAuthorized, null, 'invalid token provided');
//     }

//     // req.body.username = decoded.username;
//     // req.body.role = decoded.roles[0];
//     // req.body.merchantcode = decoded.merchantCode;
//     req.user = decoded;
//     next();

//     // } catch (error) {
//     //     return ApiResponse.error(res, apiStatusCodes.serverError, null, error);
//     // }
// }

const validateUser = async (req: Request, res: Response, next: Function) => {

    const exisitngUser = await usersModel.findOne({
        $or: [
            { emailAddress: req.body.emailAddress },
            { username: req.params.username },
            { phoneNumber: req.body.phone }
        ]
    });

    if ((!!exisitngUser)) {
        return ApiResponse.error(res, apiStatusCodes.badRequest, null, 'Account already exist');
    }
    else {
        next()
    }

}

const validateUserExist = async (req: Request, res: Response, next: Function) => {

    const exisitngUser = await usersModel.findOne({
        $or: [
            { emailAddress: req.body.emailAddres || req.body.email },
            { username: req.params.username },
            { phoneNumber: req.body.phone }
        ]
    });

    if ((!!exisitngUser)) {
        next()
    }
    else {
        return ApiResponse.error(res, apiStatusCodes.badRequest, null, 'User Not found');

    }

}

const permission = (accessLevel) => (req, res, next) => {
    const approval = req.user.permissions;

    if (!approval.includes(accessLevel)) {
        return ApiResponse.send(res, apiStatusCodes.unAuthorized, null,  'You are not permitted to access this content.');
    }
    return next()
}

export {
    permission, validateUser, validateUserExist, validateRequest, validateStaticAuthorization, validateAssignTerminalRequest,
    verifyToken, validateCreateUserRequest, validateStaticAuthorizationHeader
}

