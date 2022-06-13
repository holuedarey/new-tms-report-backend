import express from 'express';
import { authController } from '../controller/index.controller';
import { signInSchema } from '../middlewares/validators/schemas/auth.schema';
import { validateRequest } from '../middlewares/validators/requestValidator';

const authRoute = express.Router();


authRoute.post('/signin', validateRequest(signInSchema), authController.signIn);

export default authRoute;
