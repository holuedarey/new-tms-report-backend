import 'dotenv/config';

const apiStatusCodes = {
    success: 0,
    created: 0,
    httpSuccess: 200,
    noContent: 204,
    badRequest: 400,
    unAuthorized: 401,
    forbidden: 403,
    notFound: 404,
    custom: 444,
    conflict: 409,
    serverError: 100,
    httpserverError: 500,
};


const threshold =  {
    A: Number(process.env.BandA_threshold) || 100000000,
    B: Number(process.env.BandB_threshold) || 20000000,
    C: Number(process.env.BandC_threshold) || 15000000,
};

const weekThreshold = {
    A: Number(process.env.BandA_threshold_Weekly) || 1000000000,
    B: Number(process.env.BandB_threshold_Weekly) || 200000000,
    C: Number(process.env.BandC_threshold_Weekly) || 50000000,
};

const dateGroup = {
    daily: "daily",
    weekly: "week",
    monthly: "month",
    biAnnual: "bi",
    annual: "year",
    range: "range",
};

const paysurecoreCredentials = {
    superadminuser: process.env.PAYSURECORE_superusername,
    superadminpassword: process.env.PAYSURECORE_superadminpassword,
    testmerchantuser: process.env.PAYSURECORE_testmerchantusername,
    testmerchantpassword: process.env.PAYSURECORE_testmerchantpassword
}

const paysurecoreEndpoints = {
    gettoken: `${process.env.PAYSURECOREBASEURL}/login/auth`,
    addterminals: `${process.env.PAYSURECOREBASEURL}/merchants/addterminals`,
    getTerminalsByMerchantCode:`${process.env.PAYSURECOREBASEURL}/merchants/`, // to be added to this url /:merchantCode/terminals
}


export { apiStatusCodes, threshold, weekThreshold, 
    dateGroup, paysurecoreEndpoints, paysurecoreCredentials }