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