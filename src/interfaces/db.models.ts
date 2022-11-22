import { ExecSyncOptionsWithStringEncoding } from "child_process";
import { Document } from "mongoose";

export interface IPermissions {
    permission_name: string,
    description: string,
    active: string
}

export interface IRoles {
    role_name: string,
    permission: string,
}

export interface IUsers {
    username: string
    password: string,
    phone: string,
    email: string,
    merchantCode: string,
    walletId: string,
    roles: string[]
}

export interface IUserToken extends Document {
    isApproved: boolean;
    name:string;
    roles: any[];
    permissions: any[];
    username: string;
    emailAddress: string;
    phoneNumber: string;
    walletId: string;
    merchantCode: string;
    iat: number;
    exp: number;
};



export interface IMerchant extends Document {
    merchant_id: string;
    tams_mid: string;
    tams_mids: any[];
    mid_link: string;
    merchant_name: string,
    username: string;
    merchant_phone: string;
    merchant_email: string;
    merchant_contact: string;
    merchant_address: string;
    merchant_account_nr: string;
    bank_code: string;
    mcc: string;
    category: string;

    merchant_description: string;
    merchant_account_name: string;
    merchant_account_type: string;
    merchant_contacts: any[],
    rc_number: string;
    business_industry: any[],
    terminals: any[],
    terminals_count: Number,
    assigned_term_count: number;
    merchant_bank_branch: string;
    opening_hours: string;
    price_ranges: string;

    profile_compliance: Object,
    referral_staff: string;
    referral_staff_id: string;
    ussd_code: string;
    business_occupation_code: string;
    pan_account_nr: string;
    msc_rate: string;
    upper_limit: string;
    settlement_cycle: string;

    bank_branch: string;
    approval_level: number;
    approved: Boolean;

    upload_id: string;
};


export interface ITerminal extends Document {
    terminalId :string;
    walletId: string;
    enabled: Boolean;
    serialNumber: string
    firmwareVerion: string;
    organisationName: string;
    organizationNotificationId: string;
    defaultLogo: Boolean;
    installationDate: Date;
    physicalAddress: string;
    postalAddress: string;
    phone: string;
    email: string;
    applicationVersion: string;
    terminalModel: string;
    applicationName: string;
    imei: string;
    primaryHost: string; // EPMS || POSVAS
    merchantCode: string
    receiptAddress: string
    downloadStatus: string; // Priority || Standard
    canDoAgencyBanking: Boolean;
    canDoPurchase: Boolean;
    reasonNoTID: string;
    block: Boolean;
};

export interface IUpdate {
    version: string;
    description: string;
    brand: string;
    model: string;
    fix: string;
    specific_terminals: string,
    terminals?: string[]
    remarks: string
    path: string
}