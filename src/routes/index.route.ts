import express from 'express';
import Response from '../helpers/apiResponse';
import { apiStatusCodes as codes } from '../helpers/constants';
import terminalRoute from './terminal.route';
import transactionRoute from './transaction.route';
import userRoute from './user.route';
import banksRoute from './banks.route';
import authRoute from './auth.route';
import { notificationRoute, regNotificationRoute } from './notification.route';

 
const indexRoutes = express.Router();

indexRoutes.use('/terminal', terminalRoute);

indexRoutes.use('/transactions', transactionRoute);

indexRoutes.use('/banks', banksRoute);

indexRoutes.use('/notification', notificationRoute);

indexRoutes.use('/regnotification', regNotificationRoute);

indexRoutes.use('/users', userRoute);

indexRoutes.use('/auth', authRoute);



indexRoutes.get('/', (req, res) => Response.send(res, codes.success, 'This app is running.'));

indexRoutes.get('*', (req, res) => Response.send(res, codes.notFound, 'Endpoint not found.'));



export default indexRoutes;