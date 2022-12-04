import express from 'express';
import { validateRequest } from '../middlewares/validators/requestValidator';
import MerchantController from '../controller/merchant.conmtroller';
import { assignMerchants } from '../middlewares/validators/schemas/merchant.schema';

/**
 * Routes of '/merchnants'
 */
const merchantRouter = express.Router();

merchantRouter.get('/', MerchantController.viewAll);
merchantRouter.get('/count', MerchantController.getCount);
merchantRouter.get('/view/:mid', MerchantController.viewOne);
merchantRouter.get('/transaction-summary', MerchantController.txnSummary);
merchantRouter.get('/terminal-performance/:mid', MerchantController.terminalPerformance);

merchantRouter.get('/onboard', MerchantController.getOnBoard);
merchantRouter.post('/onboard',  validateRequest(assignMerchants), MerchantController.createMerchant);
merchantRouter.patch('/update/:mid',  MerchantController.update);
merchantRouter.patch('/activate-deactivate/:merchantCode',  MerchantController.activateDeactvateMerchant);

export default merchantRouter;
