var nodemailer = require('nodemailer');

async function SendMail(body) {
  console.log(body)
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'certifis.cf@gmail.com',
      pass: 'certifis@123'
    }
  });
  let result = await transporter.sendMail(body);
  return result;
}
module.exports = { SendMail }