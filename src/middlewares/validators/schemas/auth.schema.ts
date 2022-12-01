import Joi, { string } from 'joi';


const signInSchema = Joi.object(
    {
        "username": Joi.string().required(),
        "password": Joi.string().required(),
    });

const forgetPasswordSchema = Joi.object(
    {
        "email": Joi.string().required(),
    });

const resetPasswordSchema = Joi.object(
    {
        "email": Joi.string().required(),
        "password": Joi.string().required(),
        "token": Joi.string().required(),

    });


const changeRoleSchema = Joi.object(
    {
        "newRole": Joi.string().required()
    });

const activateDeactivateSchema = Joi.object(
    {
        "email": Joi.string().required()
    });
const createUserSchema = Joi.object(
    {
        "username": Joi.string(),
        "name": Joi.string(),
        "emailAddress": Joi.string().required(),
        "phoneNumber": Joi.string().required(),
        "password": Joi.string().required(),
        "role": Joi.string().required(),
        "permission": Joi.string().required(),

    });



const createUserBulk = Joi.array().items(createUserSchema);



export { createUserBulk, createUserSchema, signInSchema, changeRoleSchema, activateDeactivateSchema, resetPasswordSchema, forgetPasswordSchema };

