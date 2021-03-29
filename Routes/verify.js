const express = require('express');
const router = express.Router()
const batch = require('../models/batch')
const batch_cert = require('../models/batch_certificates')
const cert = require('../models/certificate');
const mongoose = require("mongoose");
const { GetCertificate } = require("../BlockChain/query")
const { SendMail } = require("../js/nodemailer")
const config = require("config")

router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
            return res.status(400).send("Invalid Code");
        if (req.app.get("BlockChain_Enable")) {
            var result = await GetCertificate(req.params.id)
            result = JSON.parse(result)
            result.blockchain = true
        }
        else {
            var result = await cert.findOne({ _id: req.params.id, 'publish.status': true }).lean()
            if (!result) {
                var bcert = await batch_cert.findOne({ _id: req.params.id }, { updatedby: 0 })
                if (bcert) {
                    var b1 = await batch.findOne({ _id: bcert.batch_id, 'publish.status': true }, { updatedby: 0 }).lean()
                    if (b1) {
                        b1.issue_date = bcert.issue_date
                        b1.batch_id = b1._id
                        b1._id = bcert._id
                        b1.name = bcert.name
                        b1.email = bcert.email
                        b1.blockchain = false
                    } else {
                        return res.status(404).send()
                    }
                }
                else {
                    return res.status(404).send()
                }
                result = b1
            }

        }
        if (result.expiry_date && result.expiry_date - Date.now() < 0) {
            result.is_expired = true
            result.message = "The Certificate is verfied but the validity is expired"
        } else {
            result.is_expired = false
            result.message = "The Certificate is verfied"
        }
        // let x = await SendMail(
        //     {
        //         from: `${config.get("org.name")} <certifis.cf@gmail.com>`,
        //         to: 'muhammadrafay151@gmail.com',
        //         subject: 'Certificate Verification',
        //         text: `Your ${result.title} certificate is verfied from the ${config.get("org.name")} Servers`
        //     }
        // )
        // console.log(x)
        res.json(result)
    }
    catch (err) {
        console.log(err)
        res.status(500).send()
    }
})
module.exports = router