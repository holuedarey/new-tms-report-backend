import Joi, { string } from 'joi';

const createNotificationServiceSchema = Joi.object(
    {
        "name": Joi.string().required(),
        "url": Joi.string().required(),
        "key": Joi.string().required(),
        "reversalUrl": Joi.string().required(),
        "notificationClass": Joi.string().required(),
        "authorizationToken": Joi.string().required(),
        "enabled": Joi.boolean().required(),

        username: Joi.string(),
        role: Joi.string(),
        merchantcode: Joi.string(),
    });


const registerNotificationScehma = Joi.object(
    {
        "name": Joi.string().required().optional().allow(null, ""),
        "merchantId": Joi.string().required().optional().allow(null, ""),
        "terminalId": Joi.string().required().optional().allow(null, ""),
        "identifier": Joi.string().required().optional().allow(null, ""),
        "notificationService": Joi.string().optional().allow(null, ""),
        "enabled": Joi.boolean().required(),
        "selectors": Joi.array().items(Joi.string()).optional().allow(null, ""),

        username: Joi.string(),
        role: Joi.string(),
        merchantcode: Joi.string(),
    });



export { createNotificationServiceSchema, registerNotificationScehma };
