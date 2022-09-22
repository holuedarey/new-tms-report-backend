import Band from '../model/bands.model'
import BankConfig from '../model/bankconfigs.model'
import BankSummary from '../model/bankSummary.model'
import DisputeJournals from '../model/disputejournals.model'
import HostConfig from '../model/hostconfigs.model'
import Interswitch from '../model/interswitchConfig.model'
import Journal from '../model/journal.model'
import Merchants from '../model/merchantSummary.model'
import MerchantSummary from '../model/merchantSummary.model'
import Notificationservice from '../model/notificationservice.model'
import Permission from '../model/permission.model'
import RegisteredNotification from '../model/registerednotification.model'
import Remote from '../model/remote.update'
import Reports from '../model/reports.model'
import Roles from '../model/roles.model'
import SocketUser from '../model/socketUser.model'
import StateData from '../model/stateData.model'
import TerminalConfigs from '../model/terminalConfigs.model'
import TerminalKeys from '../model/terminalkeys.model'
import TerminalStates from '../model/terminalStates.model'
import UserAgentmanagement from '../model/userAgentmanagement.model'
import Users from '../model/users.model'
import Vasjournals from '../model/vasjournals.model'


export const model_list = {
    'band': Band.find({}),
    'bank_config': BankConfig.find({}),
    'bank_summary': BankSummary.find({}),
    'dispute_jornals': DisputeJournals.find({}),
    'host_config': HostConfig.find({}),
    'interswitch': Interswitch.find({}),
    'journal': Journal.find({}),
    'merchants': Merchants.find({}),
    'merchantSummary': MerchantSummary.find({}),
    'notificationservice': Notificationservice.find({}),
    'permission': Permission.find({}),
    'registeredNotification': RegisteredNotification.find({}),
    'remote': Remote.find({}),
    'reports': Reports.find({}),
    'roles': Roles.find({}),
    'socketUser': SocketUser.find({}),
    'stateData': StateData.find({}),
    'terminalConfigs': TerminalConfigs.find({}),
    'terminalKeys': TerminalKeys.find({}),
    'terminalstates': TerminalStates.find({}),
    'userAgentmanagement': UserAgentmanagement.find({}),
    'users': Users.find({}),
    'vasjournals': Vasjournals
}