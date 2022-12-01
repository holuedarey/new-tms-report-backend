import express from 'express';
import { authController } from '../controller/index.controller';
import { signInSchema, forgetPasswordSchema, resetPasswordSchema } from '../middlewares/validators/schemas/auth.schema';
import { validateRequest } from '../middlewares/validators/requestValidator';

const authRoute = express.Router();


authRoute.post('/signin', validateRequest(signInSchema), authController.signIn);

authRoute.route('/reset').post(validateRequest(forgetPasswordSchema), authController.requestResetPassword);
authRoute.route('/reset').patch(validateRequest(resetPasswordSchema), authController.resetPassword);

export default authRoute;
