import express from 'express';
import { transactionController } from '../controller/index.controller';
import { validateStaticAuthorization, verifyToken } from '../middlewares/validators/requestValidator';
import { extractCSVData } from '../middlewares/csvupload.middleware';
import utils from '../helpers/utils';

const transactionRoute = express.Router();
const singleUploader = utils.multerTempUploadHandler().single('file');

transactionRoute.get('/requery', verifyToken, transactionController.getTransactionRequery);

transactionRoute.get('/', verifyToken, transactionController.getTransactions);

// type = tlm || vas
transactionRoute.get('/:type/', verifyToken, transactionController.getTransactionsTLM);

// type = tlm || vas
transactionRoute.get('/:type/generate-file', verifyToken, transactionController.generateFileTlm);

// type = tlm || vas
transactionRoute.get('/:type/download-file', verifyToken, transactionController.getGeneratedFile);



export default transactionRoute;