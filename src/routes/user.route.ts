import express from 'express';
import { userController } from '../controller/index.controller';
//import { extractCSVData } from '../middlewares/validators/schemas/auth.schema';
import { extractCSVData } from '../middlewares/csvupload.middleware';
import { validateCreateUserRequest, verifyToken } from '../middlewares/validators/requestValidator';
import utils from '../helpers/utils';
import PolicyConfig from "../middlewares/validators/policyConfigValidator";

const userRoute = express.Router();


const singleUploader = utils.multerTempUploadHandler().single('file');


userRoute.get('/balance/:scope', 
    verifyToken,
    PolicyConfig.isB2b,
    userController.getWalletMainBalance);

//  userRoute.get('/balance/:scope', 
//     verifyToken,
//     PolicyConfig.isB2b,
//     userController.getWalletMainBalance);

userRoute.post('/onboarduser/:method', verifyToken,
    PolicyConfig.isAdmin,
    singleUploader, extractCSVData,
    validateCreateUserRequest(),
    userController.createUsers);

userRoute.get('/users', verifyToken, PolicyConfig.isAdmin,
    PolicyConfig.isAdmin, 
    userController.getUsersInRole);

userRoute.get('/getagents', verifyToken,
    PolicyConfig.isAdmin,
    userController.getAgentsRequest);

userRoute.put('/updateagentstatus/:action', verifyToken, PolicyConfig.isAdmin,
    userController.activateDeactvateAgent);

userRoute.get('/roles', 
    // verifyToken, 
    // PolicyConfig.isAdmin,
    userController.getRoles);

userRoute.put('/addusertorole/:username',
verifyToken, 
PolicyConfig.isAdmin, 
userController.addUserToRole
)

userRoute.delete('/deleteuserfromrole/:username',
verifyToken, 
PolicyConfig.isAdmin, 
userController.removeUserRole)

userRoute.get('/:username', userController.getUserDetails);


export default userRoute;


