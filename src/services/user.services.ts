import usersModel from '../db/model/users.model';
import rolesModel from '../db/model/roles.model';
import userAgentManagemnt from '../db/model/userAgentmanagement.model';
import { IUsers, IUserToken } from '../interfaces/db.models';
import Utils from '../helpers/utils';
import userAgentmanagementModel from '../db/model/userAgentmanagement.model';
import AuthService from '../services/auth.services';
import { ApiClient } from '../services/network.services';
import moment from 'moment';

interface IUserServices {
    createUserSingle(data: any): any;
    createUsersBulk(data: IUsers[]): any;
    getUsersInRole(role: string, page: string, limit: string): any;
    getUserDetails(username: string): any;
    getRoles(): any;
    validateUser(email: string, phone: string, username: string): any;
    getWalletBalance(isMain: boolean, username: string, password: string): any;
}


class UserServices {

    private $limit: number;
    private $skip: number;
    private authService;
    private $match;
    private apiClient: ApiClient;


    constructor() {
        this.$limit = 50;
        this.$skip = 0;
        this.$match = {};
        this.authService = AuthService;
        this.apiClient = new ApiClient();
    }

    setLimit(limit) {
        if (Utils.checkNumber(limit)) this.$limit = parseInt(limit, 10);
        return this;
    }

    setDate(start, end, range = 'd') {
        if (start) {
            range = range == 'm' ? 'month' : range;
            this.$match['createdAt'] = {
                $gte: moment(start, 'YYYY-MM-DD')
                    .tz(process.env.TZ)
                    .startOf('d').toDate(),
                $lte: moment(end || start, 'YYYY-MM-DD')
                    .tz(process.env.TZ)
                    .endOf('d').toDate(),
            };
        }
        return this;
    }

    setPage(page) {
        if (page) {
            const pageNo = Utils.checkNumber(page) ? parseInt(page, 10) : 1;
            this.$skip = (pageNo - 1) * this.$limit;
        }
        return this;
    }


    setUsername(name) {
        if (name) {
            this.$match.name = name;
        }
        return this;
    }

    setUserEmail(email) {
        if (email) {
            this.$match.email = email;
        }
        return this;
    }

    setApproved(approval) {
        if (approval) {
            this.$match.isApproved = { $exists : true}
        }
        return this;
    }

    setRoles(role) {
        if (role) {
            if (!Array.isArray(role)) role = [role];
            this.$match.roles = { $in: role };
        }
        return this;
    }

    setPermissions(permissions) {
        if (permissions) {
            if (!Array.isArray(permissions)) permissions = [permissions];
            this.$match.permissions = { $in: permissions };
        }
        return this;
    }

    setSearch(search) {
        const getSObj = (key) => {
            const obj = {};
            obj[key] = { $regex: Utils.getRegExp(search) };
            return obj;
        };
        if (search) {
            const $or = [];
            $or.push(getSObj('description'));
            $or.push(getSObj(`name`));
            $or.push(getSObj(`username`));
            $or.push(getSObj(`roles`));
            $or.push(getSObj(`emailAddress`));
            this.$match.$or = $or;
        }
        return this;
    }

    async validateUser(email: string, phone: string, username: string) {

        const exisitngUser = await usersModel.findOne({
            $or: [
                { email: email },
                { username: username },
                { phone: phone }
            ]
        });
        return !!exisitngUser;

    }

    async getWalletBalance(isMain: boolean, walletId: string) {
        let token: string;
        let authCred;
        if (isMain) {

            console.log(process.env.PAYSURE_USERNAME, process.env.PAYSURE_PASSWORD)

            authCred = await this.authService.processAuth(process.env.PAYSURE_USERNAME, process.env.PAYSURE_PASSWORD)

            token = authCred["token"];

            // console.log(authCred);
        } else {

            const user = await usersModel.findOne({ walletId });

            if (user) {
                // @ts-ignore
                authCred = await this.authService.processAuth(user.username, Utils.AESDecrypt(user.aes_password));

                if (authCred["token"] !== undefined) {
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

        return { error: false, data: response };
    }

    prepareWalletBalanceUrl(walletId: string) {
        return `${process.env.PAYSURECOREBASEURL}/transactions/merchant/balance/${walletId}`
    }

    async createUserSingle(data: any) {
        // check if username || phone || email already exists on tms
        // if (await this.validateUser(data.emailAddress, data.phoneNumber, data.username)) return false;
        const payload = {
            "username": data.username,
            "name": data.name,
            "emailAddress": data.emailAddress,
            "phoneNumber": data.phoneNumber,
            "password": await Utils.hashPassword(data.password),
            "roles": [data.role],
            "permissions": [data.permission]
        }
        return await usersModel.create(payload);

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

    async getUsersInRole() {  
      const users = await usersModel.aggregate([
            { $match: this.$match },
            { $sort: { createdAt: -1 } },
            { $skip: this.$skip },
            { $limit: this.$limit },
            {
                $project: {
                    username: "$username",
                    name: 1,
                    phone: "$phoneNumber",
                    email: "$emailAddress",
                    roles: "$roles",
                    permissions: "$permissions",
                    isApproved: 1,
                    createdAt:1,
                    _id: 1,

                }
            },
        ]);
        return users;


    }


    async userSummary(){
        let facet = {
            "approvedStatus": [
              { $match: {...this.$match, isApproved: true}},
              {
                $group: {
                  _id: 0,
                  count: {
                    $sum: 1
                  }
                }
              }
            ],
            "pendingStatus": [
              { $match: {...this.$match, isApproved: false} },
              {
                $group: {
                  _id: 0,
                  count: {
                    $sum: 1
                  }
                }
              }
            ],
          };
      
          //console.log(facet);
      
          let userSummary = await usersModel.aggregate([
            {
              $facet: facet
            },
          ]);
      
      
          return {
            rows: userSummary,
          };
    }
    async getUserDetails(username: any) {
        return await usersModel.findOne({ username }, '-password -__v -_id');
    }

    async getRoles() {
        return await rolesModel.find({}, '-_id -createdAt -updatedAt -__v');
    }


    async addToUserRole(username: string, newRole: string) {

        const data = await usersModel.findOne({ username }) as IUserToken;
        console.log("user::", data.roles)
        if (data === null) return { error: true, message: "could not find user to update role" };
        if (data.roles.includes(newRole)) return { error: true, message: `user already has role: ${newRole}` };
        if (['super-admin', 'admin'].includes(newRole)) {
            let roles = data.roles.concat(newRole);
            data.roles = roles;
            data.save();
            return { error: false, message: `Account Created successfully` };
        } else {
            return { error: true, message: "Invalid role selected" };
        }
    }

    async removeUserRole(username: string, roleToDelete: string) {

        const data = await usersModel.findOne({ username }) as IUserToken;
        if (data === null) return { error: true, message: "could not find user to update role" };
        if (['super-admin', 'admin'].includes(roleToDelete)) {
            let roles = data.roles.filter((i: string) => i === roleToDelete);
            data.roles = roles;
            data.save();
            return { error: false, message: `Account Created successfully` };
        } else {
            return { error: true, message: "Invalid role selected" };
        }
    }


    async getOnboardedAgents(filter: any) {
        this.$limit = !!filter.limit === false ? this.$limit : parseInt(filter.limit);

        const page = !!filter.page === false ? "1" : filter.page;

        const skip = Utils.setPage(page, this.$limit);

        // add other filter options
        const $match = {};

        $match["userType"] = filter.userType === undefined ? "agent" : filter.userType;

        if (filter.status) {

            $match["isApproved"] = filter.status === "approved" ? true : false;
        }

        if (filter.parentCode) {
            $match["parentCode"] = filter.parentCode
        }

        if (filter.walletId) {
            $match["walletId"] = filter.walletId
        }

        if (filter.state) {
            $match["state"] = filter.state
        }
        const onboardedAgents = await userAgentmanagementModel.aggregate([
            { $match },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: this.$limit },
            {
                $project: {
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
                }
            },
        ]);

        // console.log("onboarded agents: ", onboardedAgents);

        return onboardedAgents;
    }


    async activateAgent(emailAddress: string) {
        const user = await usersModel.findOne({ emailAddress }) as IUserToken;
        console.log("activate user",user)
        if (user && user.emailAddress) {
            user.isApproved = !user.isApproved;
            user.save();
            return user;
        }else{
            return false;
        }
    }


    async getUserByWalletId(walletId: string) {
        const user = await userAgentManagemnt.findOne({ walletId }, 'agentName parentCode phoneNumber emailAddress logoUrl addressLine1 addressLine2 state lga walletId');
        return user;
    }

}

export default UserServices;