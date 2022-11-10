import express from 'express';
import { auditController } from '../controller/index.controller';

const auditRoute = express.Router();


auditRoute.get('/', auditController.getAuditTrails);

export default auditRoute;
