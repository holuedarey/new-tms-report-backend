import Joi, { required, string } from 'joi';


const assignMerchants = Joi.object(
    {

        name: Joi.string().required(),
        email: Joi.string().required().allow(null, ""),
        phoneNumber: Joi.string().required(),
        account: Joi.string().allow(null, ""),
        bank: Joi.string().allow(null, ""),
        band: Joi.string().required(),
        supportStaff: Joi.string().required(),
        merchantCode: Joi.string().required(),
        isApproved: Joi.boolean().required().allow(null, false),

    });


export default assignMerchants;

