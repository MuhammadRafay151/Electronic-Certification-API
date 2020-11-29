const express = require('express');
const router = express.Router()

const auth = require('../Auth/Auth')
const mail = require('../js/nodemailer')

router.post('/', auth.authenticateToken, auth.CheckAuthorization(["SuperAdmin"]), async (req, res) => {
    
    //{
    //    from: 'NED <certifis.cf@gmail.com>',
    //    to: 'muhammadrafay151@gmail.com',
    //    subject: 'Succesfully Registered',
    //    text: 'You have been succesfully Registered under NED in Certifis Block chain'
    //}

    mail.transporter.sendMail(req.body, function(error, info){
    if (error) {
          //console.log(error);
          res.json(error)
    } else {
          //console.log('Email sent: ' + info.response);
          res.json('Email sent: ' + info.response)
    }


})})


module.exports = router