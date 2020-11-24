const { response } = require('express');
const express = require('express');
const router = express.Router()
const Auth = require('../Auth/Auth')
const Roles = require('../js/Roles')
const batch_cert = require('../models/batch_certificates')
const batch = require('../models/batch')
const cert = require('../models/certificate');
var pagination = require('./../js/pagination');
router.post("/single", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {
    try {
        var publish = {
            status: true,
            publisher_name: req.user.name,
            publisher_email: req.user.email,
            publish_date: Date.now()
        }
        var crt = await cert.findOneAndUpdate({ _id: req.body.id, 'issuedby.org_id': req.user.org_id,'publish.status': false }, { $set: { publish: publish } })
        if (crt) {
            res.status(200).send("Published successfully")
        } else {
            res.status(404).send()
        }
    } catch (err) {
        res.status(500).send()
    }
})
router.post("/batch", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {
    try {
        var publish = {
            status: true,
            publisher_name: req.user.name,
            publisher_email: req.user.email,
            publish_date: Date.now()
        }
        var crt = await batch.findOneAndUpdate({ _id: req.body.id, 'createdby.org_id': req.user.org_id,'publish.status': false }, { $set: { publish: publish } })
        if (crt) {
            res.status(200).send("Published successfully")
        } else {
            res.status(404).send()
        }
    } catch (err) {
        res.status(500).send()
    }
})

module.exports = router