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
router.get("/single/:id?", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {

    if (req.params.id == null) {
        var perpage = 5
        var pageno = req.query.pageno
        var query = { 'issuedby.org_id': req.user.org_id, 'publish.status': true }
        if (isNaN(parseInt(pageno))) { pageno = 1 }
        var result = await cert.find(query, { logo: 0, signature: 0, certificate_img: 0 }, { skip: pagination.Skip(pageno || 1, perpage), limit: perpage });
        if (pageno == 1) {
            var total = await cert.find(query).countDocuments();
            result = { "list": result, totalcount: total }
        } else { result = { "list": result } }
        res.json(result)
    } else {
        var result = null;
        var query = { _id: req.params.id, 'issuedby.org_id': req.user.org_id, 'publish.status': true }
        result = await cert.findOne(query);
        if (result)
            res.json(result)
        else
            res.status(404).send()
    }
})
router.get("/batch/:id?", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {

    if (req.params.id == null) {
        var perpage = 5
        var pageno = req.query.pageno
        var query = { 'createdby.org_id': req.user.org_id, 'publish.status': true }
        if (isNaN(parseInt(pageno))) { pageno = 1 }
        var result = await batch.find(query, { logo: 0, signature: 0, certificate_img: 0 }, { skip: pagination.Skip(pageno || 1, perpage), limit: perpage });
        if (pageno == 1) {
            var total = await batch.find(query).countDocuments();
            result = { "list": result, totalcount: total }
        } else { result = { "list": result } }
        res.json(result)
    } else {
        var result = null;
        var query = { _id: req.params.id, 'createdby.org_id': req.user.org_id, 'publish.status': true }
        result = await batch.findOne(query);
        if (result)
            res.json(result)
        else
            res.status(404).send()
    }
})
module.exports = router