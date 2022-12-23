import express from 'express';
import { bankController } from '../controller/index.controller';
import { validateStaticAuthorization, verifyToken } from '../middlewares/validators/requestValidator';
 
const banksRoute = express.Router();

banksRoute.get('/list', verifyToken, bankController.getAllBanks);

banksRoute.get('/get-report-week-month', verifyToken, bankController.generateReportByWeekOrMonth);

banksRoute.get('/get-card-scheme-percent', verifyToken, bankController.getBankTransactionWithCardSchemePercentage);

banksRoute.get('/get-card-scheme-percent-failed-approved', verifyToken, bankController.getBankTransactionWithCardSchemePercentageWithFailandApproved);

banksRoute.get('/get-transactions-status-percent', verifyToken, bankController.getBankTransactionWithStatusPercentage);

banksRoute.get('/get-pattern-with-status', verifyToken, bankController.getBanksBehaviouralPatternWithStatus);

banksRoute.get('/get-decline-approved-status-summary', verifyToken, bankController.getDeclinedOrApprovedStatusSummary);

banksRoute.get('/get-decline-approved-summary', verifyToken, bankController.getDeclinedOrApprovedSummary);

banksRoute.get('/get-decline-approved-summary-count', verifyToken, bankController.getDeclinedOrApprovedSummaryTotalBankCount);

banksRoute.get('/get-least-performing', verifyToken, bankController.getLeastBanksSummary);

banksRoute.get('/get-top-performing', verifyToken, bankController.getTopBanksSummary);

banksRoute.get('/get-top-error', verifyToken, bankController.getTopError);
banksRoute.get('/income', verifyToken, bankController.getBankTransactionWithIncome);



export default banksRoute;


