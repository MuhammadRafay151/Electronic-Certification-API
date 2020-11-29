var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'certifis.cf@gmail.com',
      pass: 'certifis@123'
    }
  });

  module.exports={transporter:transporter}