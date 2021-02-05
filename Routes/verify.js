const express = require('express');
const router = express.Router()
const batch = require('../models/batch')
const batch_cert = require('../models/batch_certificates')
const cert = require('../models/certificate');
const mongoose =require("mongoose");
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id))
           return res.status(400).send("Invalid Code");
        if (req.app.get("BlockChain_Enable")) {
            res.status(503).send()
        } else {
            var result = await cert.findOne({ _id: req.params.id }).lean()
            if (!result) {
                var bcert = await batch_cert.findOne({ _id: req.params.id }, { updatedby: 0 })
                if (bcert) {
                    var b1 = await batch.findOne({ _id: bcert.batch_id, 'publish.status': true }, { updatedby: 0 }).lean()
                    b1.issue_date = bcert.issue_date
                    b1.batch_id = b1._id
                    b1._id = bcert._id
                    b1.name = bcert.name
                    b1.email = bcert.email

                }
                else {
                    return res.status(404).send()
                }
                result = b1
            }
            if (result.expiry_date && result.expiry_date - Date.now() < 0) {
                result.is_expired = true
                result.message = "The Certificate is verfied but the validity is expired"
            } else {
                result.is_expired = false
                result.message = "The Certificate is verfied"
            }
            res.json(result)
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send()
    }
})
module.exports = router