import usersModel from '../db/model/users.model';
import rolesModel from '../db/model/roles.model';
import userAgentManagemnt from '../db/model/userAgentmanagement.model';
import { IUsers } from '../interfaces/db.models';
import Utils from '../helpers/utils';
import userAgentmanagementModel from '../db/model/userAgentmanagement.model';
import AuthService from '../services/auth.services';
import { ApiClient } from '../services/network.services';

interface IUserServices {
    createUserSingle(data: any): any;
    createUsersBulk(data: IUsers[]): any;
    getUsersInRole(role: string,page: string,limit: string): any;
    getUserDetails(username: string): any;
    getRoles(): any;
    validateUser(email:string,phone:string,username:string): any;
    getWalletBalance(isMain: boolean, username: string, password: string): any;
}

class UserServices {

    private $limit: number;
    private $skip: number;
    private authService;
    private apiClient: ApiClient;


    constructor() {
        this.$limit = 50;
        this.$skip = 0;
        this.authService = AuthService;
        this.apiClient = new ApiClient();
    }


   async validateUser(email: string, phone: string, username: string) {
        
        const exisitngUser = await usersModel.findOne({$or: [
            {email: email},
            {username: username},
            {phone: phone}
        ]});

        return !!exisitngUser;

    }

    async getWalletBalance(isMain: boolean, walletId: string) {
        let token: string;
        let authCred;
        if(isMain) {

            console.log(process.env.PAYSURE_USERNAME, process.env.PAYSURE_PASSWORD)

            authCred = await this.authService.processAuth(process.env.PAYSURE_USERNAME, process.env.PAYSURE_PASSWORD)

            token = authCred["token"];

            // console.log(authCred);
        } else {

            const user = await usersModel.findOne({ walletId });

            if(user) {
                // @ts-ignore
                authCred = await this.authService.processAuth(user.username, Utils.AESDecrypt(user.aes_password));

                if(authCred["token"] !== undefined) {
                    token = authCred["token"];
                } 

                return { error: true, message: 'Could not fetch balance' };
            }

            return { error: true, message: 'Could not fetch balance' };

        }


        const headers = {
            authorization: `Bearer ${token}`
        } 

        const response = await this.apiClient.sendGetRequest(headers, this.prepareWalletBalanceUrl(authCred.walletId));

        return {error: false, data: response};
    }

    prepareWalletBalanceUrl(walletId: string) {
        return `${process.env.PAYSURECOREBASEURL}/transactions/merchant/balance/${walletId}`
    }

    async createUserSingle(data: any) {

        // check if username || phone || email already exists on tms

        if(this.validateUser(data.email, data.phone, data.username)) return false;

        return await usersModel.create(data);

    }

    async createUsersBulk(data: IUsers[]) {

        const failed = [];
        const successful = [];

        for (const upload of data) {

            const checkIfUserexists = await this.validateUser(upload.email, upload.phone, upload.username);

            if (checkIfUserexists) {

                failed.push(upload);

            } else {

                await this.createUserSingle(upload);

                successful.push(upload)

            }
        }

        return { failed, successful };

    }

    async getUsersInRole(role: any, page: any, limit:any =null) {

        this.$limit = limit === null ? this.$limit : parseInt(limit);

        const skip = Utils.setPage(page, this.$limit);

        const $match = role !== null ? { role } : {};

        const users = await usersModel.aggregate([
        { $match },
        { $sort: {createdAt: -1 } },
        { $skip: skip },
        { $limit: this.$limit },
        { $project: {
            username: "$username", 
            // password: "$password",
            phone: "$phone",
            email: "$email",
            merchantCode: "$merchantCode",
            walletId: "$walletId",
            role: "$role"
        }},
        ]);
        return users; 


    }

    async getUserDetails(username: any) {
        return await usersModel.findOne({ username }, '-password -__v -_id');
    }

    async getRoles() {
        return await rolesModel.find({}, '-_id -createdAt -updatedAt -__v');
    }


    async addToUserRole(username: string, newRole: string) {
    
            return new Promise((resolve, reject) => {

                usersModel.findOne({ username }, (err, data) => {

                    if(err) return resolve({ error: true, message: "could not update user role" });

                    if(data === null) return resolve({ error: true, message: "could not find user to update role" });

                    if(data.roles.includes(newRole)) return resolve({ error: true, message: `user already has role: ${newRole}`})

                    let roles = data.roles.concat(newRole);

                    data.roles = roles;

                    data.save();

                    data["password"] = undefined;

                    resolve({error: false, data});

                })
            });

    }

    async removeUserRole(username: string, roleToDelete: string) {

        return new Promise((resolve, reject) => {

            usersModel.findOne({ username }, (err, data) => {

                if(err) return resolve({ error: true, message:"could not update user role"});

                if(data === null) return resolve({ error: true, message:"could not find user to update role"});

                let roles = data.roles.filter((i: string) => i === roleToDelete);

                data.roles = roles;

                data.save();

                resolve(data);

            })
        });

    }


    async getOnboardedAgents(filter: any) {
            this.$limit = !!filter.limit === false ? this.$limit : parseInt(filter.limit);

            const page = !!filter.page === false ? "1" : filter.page;
    
            const skip = Utils.setPage(page, this.$limit);

            // add other filter options
            const $match = {};

            $match["userType"] = filter.userType === undefined ? "agent" : filter.userType;

            if(filter.status) {

                $match["isApproved"] = filter.status === "approved" ? true : false;
            }

            if(filter.parentCode) {
                $match["parentCode"] = filter.parentCode 
            }

            if(filter.walletId) {
                $match["walletId"] = filter.walletId
            }

            if(filter.state) {
                $match["state"] = filter.state
            }
            const onboardedAgents = await userAgentmanagementModel.aggregate([
            { $match },
            { $sort: {createdAt: -1 } },
            { $skip: skip },
            { $limit: this.$limit },
            { $project: {
                username: "$username", 
                agentName: "$agentName",
                contactPersonName: "$contactPersonName",
                parentCode: "$parentCode",
                walletId: "$walletId",
                emailAddress: "$emailAddress",
                logoUrl: "$logoUrl",
                addressLine1: "$addressLine1",
                addressLine2: "$addressLine2",
                state: "$state",
                lga: "$lga",
                city: "$city",
                bandName: "$bandName",
                organisationCode: "$organisationCode",
                userType: "$userType",
                isApproved: "$isApproved",
                dateOnBoarded: "$dateOnBoarded"
            }},
            ]);

            // console.log("onboarded agents: ", onboardedAgents);

            return onboardedAgents; 
    }


    async activateAgent(action: boolean, emailAddress: string) {

        const user = await userAgentManagemnt.findOne({ emailAddress });

        // console.log(user.walletId)

        // @ts-ignore
        if (user && !user.walletId) {

            // @ts-ignore
            const password = !user.aes_password ? user.password : Utils.AESDecrypt(user.aes_password);

            // @ts-ignore
            const authCred = await this.authService.processAuth(user.username, password);
            console.log(authCred);

            if(!authCred) {
                return false;
            }
            const updateResponse = await userAgentManagemnt.findOneAndUpdate({ emailAddress }, { isApproved: action, walletId: authCred.walletId });
            return updateResponse;
        }

        const updateResponse = await userAgentManagemnt.findOneAndUpdate({ emailAddress }, { isApproved: action });
    
        return updateResponse;


    }


    async getUserByWalletId(walletId: string) {
        const user = await userAgentManagemnt.findOne({ walletId }, 'agentName parentCode phoneNumber emailAddress logoUrl addressLine1 addressLine2 state lga walletId');
        return user;
    }

}

export default new UserServices();