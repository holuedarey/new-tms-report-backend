// import express from 'express';
// import  TransactionControllerV2  from '../controller/transaction.controllerV2';
// import { validateStaticAuthorization, verifyToken } from '../middlewares/validators/requestValidator';
// import { extractCSVData } from '../middlewares/csvupload.middleware';
// import utils from '../helpers/utils';

// const transactionRoute = express.Router();
// const singleUploader = utils.multerTempUploadHandler().single('file');

// transactionRoute.get('/requery', verifyToken, TransactionControllerV2.getTransactionRequery);

// transactionRoute.get('/', verifyToken, TransactionControllerV2.getTransactions);

// // type = tlm || vas
// transactionRoute.get('/:type/', verifyToken, TransactionControllerV2.getTransactionsTLM);

// // type = tlm || vas
// transactionRoute.get('/:type/generate-file', verifyToken, TransactionControllerV2.generateFileTlm);

// // type = tlm || vas
// transactionRoute.get('/download-file', verifyToken, TransactionControllerV2.getGeneratedFile);



// export default transactionRoute;