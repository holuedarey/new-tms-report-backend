import Joi, { string } from 'joi';


const signInSchema = Joi.object(
    {
        "username": Joi.string().required(),
        "password": Joi.string().required(),
    });

const createUserSchema = Joi.object(
    {
        "username": Joi.string(),
        "email": Joi.string().required(),
        "phone": Joi.string().required(),
        "password": Joi.string().required(),
        "merchantCode": Joi.string().required(),
        "walletId": Joi.string().required(),
        "roles": Joi.string().required()
    });



const createUserBulk = Joi.array().items(createUserSchema);



export { createUserBulk, createUserSchema, signInSchema,  };

