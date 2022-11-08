import express from 'express';
import { userController } from '../controller/index.controller';
//import { extractCSVData } from '../middlewares/validators/schemas/auth.schema';
import { extractCSVData } from '../middlewares/csvupload.middleware';
import { validateCreateUserRequest, verifyToken, validateUser, validateUserExist, validateRequest, permission } from '../middlewares/validators/requestValidator';
import utils from '../helpers/utils';
import PolicyConfig from "../middlewares/validators/policyConfigValidator";
import { changeRoleSchema, activateDeactivateSchema } from '../middlewares/validators/schemas/auth.schema';

const userRoute = express.Router();


const singleUploader = utils.multerTempUploadHandler().single('file');



userRoute.post('/onboarduser/:method', verifyToken,
    PolicyConfig.isAdmin,
    singleUploader, extractCSVData,
    validateCreateUserRequest(),
    validateUser,
    userController.createUsers);

userRoute.get('/users', verifyToken,
    PolicyConfig.isAdmin,
    userController.getUsersInRole);


userRoute.get('/roles',
    userController.getRoles);

userRoute.put('/addusertorole/:username',
    verifyToken,
    validateRequest(changeRoleSchema),
    validateUserExist,
    PolicyConfig.isAdmin,
    userController.addUserToRole
);


userRoute.delete('/deleteuserfromrole/:username',
    verifyToken,
    validateRequest(changeRoleSchema),
    validateUserExist,
    PolicyConfig.isAdmin,
    userController.removeUserRole)

    userRoute.put('/activate-deactivate',
    verifyToken,
    validateRequest(activateDeactivateSchema),
    validateUserExist,
    PolicyConfig.isAdmin,
    permission('approval'),
    userController.activateDeactvateUser
);
userRoute.get('/:username', userController.getUserDetails);


export default userRoute;


