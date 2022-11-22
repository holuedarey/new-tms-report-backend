import express from 'express';
// import validateInputs2 from 'json-request-validator';
// import { isAdmin } from '../middlewares/authentication';
import MerchantController from '../controller/merchant.conmtroller';
// import { merchOnBoardRules, merchOnBoard2Rules } from '../middlewares/validationRules';

/**
 * Routes of '/merchnants'
 */
const merchantRouter = express.Router();

// merchantRouter.get('/', MerchantController.viewAll);
merchantRouter.get('/count', MerchantController.getCount);
// merchantRouter.get('/view/:mid', MerchantController.viewOne);
// merchantRouter.get('/transaction-summary', MerchantController.txnSummary);
// merchantRouter.get('/terminal-performance/:mid', MerchantController.terminalPerformance);

merchantRouter.get('/onboard', MerchantController.getOnBoard);
// merchantRouter.post('/onboard',  MerchantController.onBoard);
// merchantRouter.patch('/onboard',  MerchantController.onBoard2);
// merchantRouter.post('/approve',  MerchantController.approveOnBoard);
merchantRouter.patch('/approve',  MerchantController.setDataOnBoard);

export default merchantRouter;
