import Joi, { required, string } from 'joi';


const assignTerminal = Joi.object(
    {

        terminalId : Joi.string().required(),
        enabled: Joi.boolean().required(),
        walletId: Joi.string().required().optional().allow(null, ""),
        serialNumber: Joi.string().required(),
        firmwareVerion: Joi.string().optional().allow(null, ""),
        organisationName: Joi.string().optional().allow(null, ""),
        defaultLogo: Joi.boolean().required(),
        logoUrl: Joi.string().optional().allow(null, ""),
        // installationDate: Date,
        physicalAddress: Joi.string().optional().allow(null, ""),
        postalAddress: Joi.string().optional().allow(null, ""),
        phone: Joi.string().allow().optional().allow(null, ""),
        email: Joi.string().optional().allow(null, ""),
        applicationVersion: Joi.string().required(),
        terminalModel: Joi.string().required(),
        applicationName: Joi.string().optional().allow(null, ""),
        imei: Joi.string().required(),
        primaryHost: Joi.string().required(), // EPMS || POSVAS
        merchantCode: Joi.string().optional().allow(null, ""),
        downloadStatus: Joi.string().required().allow("Priority", "Standard"), // Priority || Standard
        canDoAgencyBanking: Joi.boolean().required(),
        canDoPurchase: Joi.boolean().required(),

        username: Joi.string(),
        role: Joi.string(),
        merchantcode: Joi.string(),




    });

const assignTerminaToWallet = Joi.object({
    walletId : Joi.string().required(),
    serialNumbers: Joi.array().items(Joi.string()).required(),
})

const assignTerminals = Joi.array().items(assignTerminal);



export { assignTerminals, assignTerminal, assignTerminaToWallet };

