import usersModel from '../db/model/users.model';
import jwt from "jsonwebtoken";
import Utils from '../helpers/utils';
import rolesModel from '../db/model/roles.model';
import Webservice from './web.services';


class AuthService {

    public async signInAgents() {



    }


    public async processAuth(username: string, password: string) {

        const response = await Webservice.getPaysureCoreToken(username, password, true);

        return response;

    }

    private prepareAuthEndpoint(requestUrl: string = null): string {

        //let urlPath = requestUrl.split("auth")[1];
        return `${process.env.PAYSURECOREBASEURL}/login/auth`;
    }



    public async signIn(username: string, password: string) {

        const user: any = await usersModel.findOne({
            $or: [
                { emailAddress: username },
                { phoneNumber: username },
                { username }
            ]
        }, '-_id -__v -createdAt -updatedAt');
        
        console.log("user::", user)
        // if(user.isApproved ==  false){
        //     return {
        //         error: true,
        //         message: "Account Not Actvated",
        //         data: null
        //     };
    
        // }
        if (Utils.validatePassword(password, user.password)) {
            user["password"] = undefined;

            return {
                error: false,
                message: "Sign In Successful",
                data: {
                    user,
                    token: Utils.generateAccessToken(user, process.env.API_SECRET_KEY),
                    tokenExpiresIn: process.env.JWTTOKENEXPIRESIN
                }
            }
        }

        return {
            error: true,
            message: "Invalid Username / Password",
            data: null
        };

    }

    public changePassword(username: string, oldpassword: string, newpassword: string) {
        throw new Error("Method not implemented.");
    }


    public async addUser(payload: any) {

        const user = new usersModel(payload);

        await user.save();

        return user;

    }


    public async getRoles() {

        const roles = await rolesModel.find({}, '-_id -__v');

        return roles;

    }


    public async getUsers(filter) {


        let $match = {
            role: filter["role"],
            walletId: filter["walletId"],
            email: filter["email"],
            username: filter["username"]
        }

        let paging = Utils.setPaging(filter);

        let $sort = {};
        $sort["createdAt"] = -1;

        const users = await usersModel.aggregate([
            { $match },
            { $sort },
            { $skip: paging.skip },
            { $limit: paging.pageSize },
        ]);

        return { users, paging };

    }


    public async buildFilter(filter) {

    }







}

export default new AuthService();