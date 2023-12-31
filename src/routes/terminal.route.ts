import express from 'express';
import { terminalController } from '../controller/index.controller';
import {
    validateStaticAuthorization, validateStaticAuthorizationHeader,
    validateAssignTerminalRequest, validateRequest,
    verifyToken
} from '../middlewares/validators/requestValidator';
import { assignTerminaToWallet } from '../middlewares/validators/schemas/terminal.schema';
import { extractCSVData } from '../middlewares/csvupload.middleware';
import Utils from '../helpers/utils';
import { upload } from '../middlewares/upload.middleware';

const terminalRoute = express.Router();
const singleUploader = Utils.multerTempUploadHandler().single('file');



terminalRoute.get('/detailsbyterminalId/:terminalId',
    verifyToken,
    terminalController.getTerminalByTerminalId);

terminalRoute.get('/detailsbySerialNumber/:serialNumber',
    verifyToken,
    terminalController.getTerminalBySerialNumber);

terminalRoute.get('/inactive-active/:merchantCode',
    verifyToken,
    terminalController.getActiveAndInactiveSummaryByMerchantCodeandWalletId);


terminalRoute.get('/getTerminals/:merchantCode',
    // verifyToken,
    terminalController.getTerminalsByMerchantCodeAndWalletId);


terminalRoute.get('/details/:serialNumber',
    validateStaticAuthorizationHeader,
    terminalController.getTerminalDetails);

terminalRoute.post('/assign/:method', verifyToken,
    singleUploader,
    extractCSVData,
    // validateAssignTerminalRequest(),
    terminalController.assignTerminal);

terminalRoute.get('/getunassignterminaltowallet/:merchantCode', verifyToken, terminalController.getTerminalUnassignedToWallet);

terminalRoute.put('/mapTerminalsToWalletId',
    validateRequest(assignTerminaToWallet),
    verifyToken,
    terminalController.assignTerminalToWalletId);

terminalRoute.put('/updateTerminal/:serialNumber',
    verifyToken,
    terminalController.updateTerminal);

terminalRoute.get('/terminalstates', verifyToken, terminalController.getTerminalsStates);

terminalRoute.get('/batterylevel-count', verifyToken, terminalController.getBatteryLevelCount);

terminalRoute.get('/batterylevel-report', verifyToken, terminalController.getBatteryLevelReport);

terminalRoute.get('/signallevel-count', verifyToken, terminalController.getSignalStatusCount);

terminalRoute.get('/signallevel-report', verifyToken, terminalController.getSignalStatusReport);

terminalRoute.get('/printerstatus-count', verifyToken, terminalController.getPrinterStatusCount);

terminalRoute.get('/printerstatus-report', verifyToken, terminalController.getPrinterStatusReports);

terminalRoute.get('/active-by-days-count', verifyToken, terminalController.getlast2DaysActiveTerminals);

terminalRoute.get('/active-by-days-report', verifyToken, terminalController.getlast2DaysActiveTerminalsReport);

terminalRoute.get('/active-inactive-volumereports', verifyToken, terminalController.getActiveInactiveVolumeReports);

terminalRoute.get('/active-inactive-volumecount', verifyToken, terminalController.getActiveInactiveCountReports);

terminalRoute.get('/location-pattern', verifyToken, terminalController.getTerminalLocationPatternTerminals);

terminalRoute.get('/health-check-pattern', verifyToken, terminalController.getHealthCheckPatternForTerminals);

terminalRoute.get('/archived-terminals', verifyToken, terminalController.getArchivedTerminals);

terminalRoute.post('/upload-software', verifyToken, upload.single('file'), terminalController.remoteUpdateTerminal);

terminalRoute.get('/update-list', verifyToken, terminalController.getTerminalSoftwareList);

terminalRoute.get('/update/:brand/:model/:current_version/:serial_number', validateStaticAuthorizationHeader, terminalController.checkTerminalUpdateAvailability);

terminalRoute.get('/download/:file', terminalController.downloadUpdate)

export default terminalRoute;