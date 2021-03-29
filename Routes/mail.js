const express = require('express');
const router = express.Router()
const auth = require('../Auth/Auth')
const role = require('../js/Roles')
const cert = require('../models/certificate')
const batch_cert = require('../models/batch_certificates');
const batch = require("../models/batch");
const { SendMail } = require('../js/nodemailer')
const config = require("config");
router.post('/single/:id', auth.authenticateToken, auth.CheckAuthorization([role.Admin, role.Issuer]), async (req, res) => {

    try {
        let result = await cert.findOne({ _id: req.params.id, 'publish.status': true })
        if (result) {
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
        } else {
            return res.status(404).send("certificate not found");
        }
    } catch (err) {
        res.status(500).send("server error")
    }

})
router.post('/batchcert/:batch_id/:cert_id', auth.authenticateToken, auth.CheckAuthorization([role.Admin, role.Issuer]), async (req, res) => {

    try {
        let bt = await batch.findOne({ _id: req.params.batch_id, 'createdby.org_id': req.user.org_id, 'publish.status': true })
        if (bt) {
            let bcert = await batch_cert.findOne({ _id: req.params.cert_id }).lean();
            if (bcert) {
                let link = config.get("app.verification_url")
                await SendMail(
                    {
                        from: `${bt.createdby.org_name} <certifis.cf@gmail.com>`,
                        to: bcert.email,
                        subject: `${bt.title} Certificate`,
                        text: `Dear ${bcert.name}  you can access your digital certificate using the following link ${link}${bcert._id}`
                    }
                )
                res.status(204).send("email sended successfully")
            } else {
                return res.status(404).send("batch certificate not found");
            }
        } else {
            return res.status(404).send("batch not found");
        }

    } catch (err) {
        res.status(500).send("server error")
    }

})
router.post('/batch/:id', auth.authenticateToken, auth.CheckAuthorization([role.Admin, role.Issuer]), async (req, res) => {
    try {
        let link = config.get("app.verification_url")
        let _batch = await batch.findOne({ _id: req.params.id, 'createdby.org_id': req.user.org_id, 'publish.status': true }).lean();
        if (_batch) {
            let _batches = await batch_cert.find({ batch_id: _batch._id }).lean();
            for (let i = 0; i < _batches.length; i++) {
                await SendMail(
                    {
                        from: `${_batch.createdby.org_name} <certifis.cf@gmail.com>`,
                        to: _batches[i].email,
                        subject: `${_batch.title} Certificate`,
                        text: `Dear ${_batches[i].name}  you can access your digital certificate using the following link ${link}${_batches[i]._id}`
                    }
                )
            }
            res.status(204).send("email sended successfully")
        }
        else {
            return res.status(404).send("batch not found");
        }

    } catch (err) {
        return res.status(500).send(err);
    }

})


module.exports = router