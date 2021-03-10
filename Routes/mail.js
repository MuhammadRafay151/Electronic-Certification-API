const express = require('express');
const router = express.Router()
const auth = require('../Auth/Auth')
const role = require('../js/Roles')
const cert = require('../models/certificate')
const { SendMail } = require('../js/nodemailer')
const config = require("config")
router.post('/single/:id', auth.authenticateToken, auth.CheckAuthorization([role.Admin, role.Issuer]), async (req, res) => {

    try {
        let result = await cert.findOne({ _id: req.params.id })
        let link = config.get("app.verification_url")
        await SendMail(
            {
                from: `${result.issuedby.org_name} <certifis.cf@gmail.com>`,
                to: result.email,
                subject: `${result.title} Certificate`,
                text: `Dear ${result.name}  you can access your digital certificate using the following link ${link}${result._id}`
            }
        )
        res.status(204).send("email sended successfully")
    } catch (err) {
        res.status(500).send("server error")
    }

})
router.post('/batchcert', auth.authenticateToken, auth.CheckAuthorization([role.Admin, role.Issuer]), async (req, res) => {



})
router.post('/batch', auth.authenticateToken, auth.CheckAuthorization([role.Admin, role.Issuer]), async (req, res) => {



})


module.exports = router