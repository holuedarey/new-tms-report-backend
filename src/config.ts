const mwFields = {
    merchant_name: 'merchantName',
    merchant_address: 'merchantAddress',
    merchant_id: 'merchantId',
    terminal_id: 'terminalId',
    stan: 'STAN',
    transaction_date: 'transactionTime',
    mcc: 'merchantCategoryCode',
    pan: 'maskedPan',
    rrn: 'rrn',
    prrn: 'prrn',
    processing_code: 'processingCode',
    amount: 'amount',
    currency_code: 'currencyCode',
    response_msg: 'messageReason',
    authcode: 'authCode',
    response_code: 'responseCode',
    handler_used: 'handlerUsed',
    mti: 'MTI',
    agent_id: 'agent_id',
    agent_name: 'agent_name',
    dispute_status: 'dispute_status',
    reference_number: 'reference_number',
    sequence: 'sequence',
    payment_method: 'payment_method',
    tracking_number: 'tracking_number',
    wallet_id: 'wallet_id',
    terminalId: 'terminal_id',
    STAN: 'stan',
    dispute_category: 'dispute_category',
    service_type: 'service_type',
    card_holder_account_name: 'card_holder_account_name',
    transaction_amount : 'transaction_amount',
    processor : 'processor',
  };
  
 
  const transMod = {
    fields: mwFields,
  
    getField: key => transMod.fields[key],
  };
 
  
  // eslint-disable-next-line import/prefer-default-export
  export { transMod };
  