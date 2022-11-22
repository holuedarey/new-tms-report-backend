import AuthController from './auth.controller';
import UserController from './users.controller';
import TerminalController from './terminal.controller';
// import TransactionController from './transaction.controller';
import BankController from './bank.controller';
import NotificationController from './notification.controller';
import RegNotificationController from './reg-notification.controller';
import AuditController from './audit.controller';


const authController = new AuthController();
const auditController =  new AuditController()
const userController = new UserController();
const terminalController = new TerminalController();
// const transactionController = TransactionController();
const bankController = new BankController();
const regNotificationController = new RegNotificationController();
const notificationContoller = new NotificationController();



export {
    authController,
    userController,
    terminalController,
    // transactionController,
    bankController,
    regNotificationController,
    notificationContoller,
    auditController
}