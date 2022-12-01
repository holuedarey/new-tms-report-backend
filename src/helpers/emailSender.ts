import axios from "axios";

/**
 * Sends email and SMS using Jamila's API
 * @param {Object} payload
 */
const sendEmailSms = (payload) => {
  const data: any = {};
  if (payload.emailRecipients) {
    data.email = [{
      sender: '',
      recipients: payload.emailRecipients,
      cc: [],
      bcc: [],
      body: payload.emailBody,
      html: payload.emailBody,
      subject: payload.emailSubject,
      details: {
        recipientsName: '',
        body: '',
      },
      attachments: payload.attachments || [],
    }];
  }
  if (!data.sms && !data.email) {
    // eslint-disable-next-line no-throw-literal
    throw { message: 'Data must contain emailRecipients or smsRecipients' };
  }

  const options: any = {
    'method': 'POST',
    'url': 'https://api.mailgun.net/v3/mg.mycreditme.com/messages',
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': 'Basic YXBpOmtleS1lMDM1ODM2YzJkMzg5NmY0N2NjYWI4NTI4NjE2MzI2OQ=='
    },
    FormData: {
      'from': 'FalconTrace no-reply@etop.com.ng',
      'to': payload.emailRecipients,
      'subject': payload.emailSubject,
      'html': payload.emailBody,
      'text': payload.emailBody
    }
  };

  // axios(options, function (error, response) {
  //   if (error) throw new Error(error);
  //   console.log(response.body);
  // });

  axios(options)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });


  // var axios = require('axios');
  // var FormData = require('form-data');
  // var datas = new FormData();
  // datas.append('from', 'FalconTrace no-reply@etop.com.ng');
  // datas.append('to', payload.emailRecipients);
  // datas.append('subject', payload.emailSubject);
  // datas.append('html', payload.emailBody);

  // var config:any = {
  //   method: 'post',
  //   url: 'https://api.mailgun.net/v3/mg.mycreditme.com/messages',
  //   headers: { 
  //     'Authorization': 'Basic YXBpOmtleS1lMDM1ODM2YzJkMzg5NmY0N2NjYWI4NTI4NjE2MzI2OQ==', 
  //     ...data.getHeaders()
  //   },
  //   data : data
  // };

  // axios(config)
  // .then(function (response) {
  //   console.log(JSON.stringify(response.data));
  // })
  // .catch(function (error) {
  //   console.log("erroyr::",error);
  // });


};

export default sendEmailSms;
