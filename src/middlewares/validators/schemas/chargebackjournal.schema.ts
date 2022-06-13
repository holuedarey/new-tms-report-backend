import Joi, { string } from 'joi';


const logChargeBackSchema = Joi.object(
    {
        ticketId: Joi.string().required(),
        transactionType: Joi.string().required(),
        transactionAmount: Joi.number()
    }
)