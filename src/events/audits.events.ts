const EventEmitter = require('events');
require('dotenv').config()
import AuditTrailService from '../services/auditTrail.services';


class AuditEvent extends EventEmitter {

    constructor(){

        super();
        this.on('complete', (payload) => {
        console.log("Payload Data,", payload)

            setImmediate(async () => {
               const audit = new  AuditTrailService();
               await audit.createAuditOperation(payload)
            });
        });
    }

}

export default AuditEvent;