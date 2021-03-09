const nodemailer = require('nodemailer');
const config = require("config")
async function SendMail(body) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.get("email.user"),
      pass: config.get("email.pass")
    }
  });
  let result = await transporter.sendMail(body);
  return result;
}
module.exports = { SendMail }