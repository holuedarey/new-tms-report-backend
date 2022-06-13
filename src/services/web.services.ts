import { ApiClient } from './network.services';
import { paysurecoreEndpoints, paysurecoreCredentials } from '../helpers/constants';

interface IWebServices {

    getPaysureCoreToken(username: string, password: string): any;

    addTerminalByMerchantCode(merchantCode: string, terminals: any[]): any;

    updateTerminalsByMerchantCode(merchantCode: string, terminals: any[]): any;

    getTerminalsbyMerchantCode(merchantCode: string): any;

}


class WebService implements IWebServices {

    private _apiClient: ApiClient;
    private httpHeaders: object;

    constructor() {
        this._apiClient = new ApiClient();
        this.httpHeaders = {
            "Content-Type": 'application/json'
        }
    }


    public async getTerminalsbyMerchantCode(merchantCode: string) {

        try {

            const token = this.getPaysureCoreToken(paysurecoreCredentials.superadminuser, paysurecoreCredentials.superadminpassword);

            if(token) {

                this.httpHeaders["Authorization"] = token;

                const response: any = await this._apiClient.sendGetRequest(this.httpHeaders,
                    `${paysurecoreEndpoints.getTerminalsByMerchantCode}/${merchantCode}/terminals`);

                return response.data;

                // if(response.data.length > 0) {

                //     return response.data.map((i: any) => i.terminalId);

                // }

            
                return response.data;

            } else {

                return false;
            }
    

            


        } catch (error) {
            
            return false;


        }

        


    }


    public async addTerminalByMerchantCode(merchantCode: string, terminals: any[]) {

        const token = await this.getPaysureCoreToken(paysurecoreCredentials.superadminuser, paysurecoreCredentials.superadminpassword);

        if(token) {

            this.httpHeaders["Authorization"] = `Bearer ${token}`;

            let requestTerminals = terminals.map((i) => {

             
                return {
                    id: 1,
                    terminalId: i.terminalId,
                    model: i.terminalModel,
                    imeiOne: i.imei,
                    imeiTwo: "",
                    serialNo: i.serialNumber,
                    active: true,
                }

            });

            const payload = {merchantCode, terminals: requestTerminals }

           
            const response: any = await this._apiClient.sendPostRequest(payload, this.httpHeaders, paysurecoreEndpoints.addterminals)

            if(response.responseCode === 0) {

                return true

            } else {

                return false;
            }


        } else {

            return false;


        }

    }

    updateTerminalsByMerchantCode(merchantCode: string, terminals: any[]) {
        throw new Error('Method not implemented.');
    }

    public async getPaysureCoreToken(username: string, password: string, dataonly = false) {

        try {
            
            const payload = { uniqueParameter: username, password }

            const response: any = await this._apiClient.sendPostRequest(payload, this.httpHeaders, paysurecoreEndpoints.gettoken);

        
            if(response.responseCode == 0) {

                return dataonly === true ? response.data : response.data.token;

            } else {

                return false;
            }

        } catch (error) {

            return false;
            
        }





    }







}

export default new WebService();