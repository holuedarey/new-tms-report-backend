// import express from 'express';
// import { transactionController } from '../controller/index.controller';
// import { validateStaticAuthorization, verifyToken } from '../middlewares/validators/requestValidator';
// import { extractCSVData } from '../middlewares/csvupload.middleware';
// import utils from '../helpers/utils';

// const transactionRoute = express.Router();
// const singleUploader = utils.multerTempUploadHandler().single('file');

// transactionRoute.get('/requery', verifyToken, transactionController.getTransactionRequery);

// transactionRoute.get('/', verifyToken, transactionController.getTransactions);

// // type = tlm || vas
// transactionRoute.get('/:type/', verifyToken, transactionController.getTransactionsTLM);

// // type = tlm || vas
// transactionRoute.get('/:type/generate-file', verifyToken, transactionController.generateFileTlm);

// // type = tlm || vas
// transactionRoute.get('/:type/download-file', verifyToken, transactionController.getGeneratedFile);



// export default transactionRoute;




import express from 'express';
import TransactionController from '../controller/transaction.controller';

/**
 * Routes of '/transactions'
 */
const transactionRouter = express.Router();

transactionRouter.get('/history', TransactionController.history);
transactionRouter.get('/download', TransactionController.downloadJournal);
transactionRouter.get('/time', TransactionController.time);
transactionRouter.get('/time-income', TransactionController.timeIncome);
transactionRouter.get('/stats-income', TransactionController.statIncome);
transactionRouter.get('/stats', TransactionController.stat);

transactionRouter.get('/stats-summary', TransactionController.statSummary);
transactionRouter.get('/failure-reasons', TransactionController.failureReason);
transactionRouter.get('/performance-records', TransactionController.performance);
transactionRouter.get('/receipt/:id', TransactionController.getReceipt);
// transactionRouter.post('/upload-file',  multerUpload('xlsx_file'), TransactionController.uploadFile);

transactionRouter.get('/bank-summary', TransactionController.banksAndCardSchemesSummary);

export default transactionRouter;