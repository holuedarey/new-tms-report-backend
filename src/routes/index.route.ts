import express from 'express';
import Response from '../helpers/apiResponse';
import { apiStatusCodes as codes } from '../helpers/constants';
import terminalRoute from './terminal.route';
import transactionRoute from './transaction.route';
import userRoute from './user.route';
import banksRoute from './banks.route';
import authRoute from './auth.route';
import { notificationRoute, regNotificationRoute } from './notification.route';
import AuditEvent from '../events/audits.events';
import auditRoute from './audit.route';


const indexRoutes = express.Router();

indexRoutes.use('/terminal', terminalRoute);

indexRoutes.use('/transactions', transactionRoute);

indexRoutes.use('/banks', banksRoute);

indexRoutes.use('/notification', notificationRoute);

indexRoutes.use('/regnotification', regNotificationRoute);

indexRoutes.use('/users', userRoute);

indexRoutes.use('/auth', authRoute);
indexRoutes.use('/audit-trail', auditRoute);

indexRoutes.get('/event', (req, res) => {
    const event  = new AuditEvent();
    event.emit('complete', "aduitPayload")
    return Response.send(res, codes.success, "ok")
});
indexRoutes.get('/', (req, res) => Response.send(res, codes.success, 'This app is running.'));

indexRoutes.get('*', (req, res) => Response.send(res, codes.notFound, 'Endpoint not found.'));



export default indexRoutes;