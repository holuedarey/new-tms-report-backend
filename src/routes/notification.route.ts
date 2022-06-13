import express, { Request, Response} from 'express';
import { notificationContoller, regNotificationController } from '../controller/index.controller';
import { createNotificationServiceSchema, registerNotificationScehma } from '../middlewares/validators/schemas/notification.schema';
import { validateRequest, validateStaticAuthorization, verifyToken } from '../middlewares/validators/requestValidator';
import { extractCSVData } from '../middlewares/csvupload.middleware';
import utils from '../helpers/utils';


const notificationRoute = express.Router();
const regNotificationRoute = express.Router();


// NotificationController Endpoints
// notificationRoute.post('/create', validateStaticAuthorization, validateRequest(createNotificationServiceSchema), notificationContoller.AddService);
// notificationRoute.patch('/update/:notificationId', validateStaticAuthorization, validateRequest(createNotificationServiceSchema), notificationContoller.UpdateService);
// notificationRoute.delete('/delete/:notificationId', validateStaticAuthorization, notificationContoller.DeleteService);

notificationRoute.post('/create', verifyToken, notificationContoller.AddService);
notificationRoute.get('/get-all', verifyToken, notificationContoller.GetNotification);
notificationRoute.get('/:notificationId', verifyToken, notificationContoller.GetServiceById);
notificationRoute.post('/search', verifyToken, notificationContoller.SearchServices);
notificationRoute.put('/update/:notificationId', verifyToken, notificationContoller.UpdateService);

// notificationRoute.post('/upload', extractCSVData, verifyToken, notificationContoller.Upload)


// RegNotificationController Endpoints
regNotificationRoute.post('/create', verifyToken, validateRequest(registerNotificationScehma), regNotificationController.AddService);
regNotificationRoute.patch('/update/:notificationId', verifyToken, validateRequest(registerNotificationScehma), regNotificationController.UpdateService);
regNotificationRoute.delete('/delete/:notificationId',  verifyToken, regNotificationController.DeleteService);
regNotificationRoute.get('/get-all', verifyToken, regNotificationController.GetServices);

regNotificationRoute.post('/search', verifyToken, regNotificationController.SearchNotifications);




regNotificationRoute.get('/:notificationId', verifyToken, regNotificationController.GetServiceById);


export { notificationRoute, regNotificationRoute };