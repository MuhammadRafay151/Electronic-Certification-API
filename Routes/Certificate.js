const express = require('express');
const auth = require('../Auth/Auth')
const router = express.Router()
const cert = require('../models/certificate');
const user = require('../models/user')
const files = require('../models/files')
var multer = require('multer')
var upload = multer()
var pagination = require('./../js/pagination');
const Roles = require('../js/Roles')
const { SingleSearch } = require("../js/search")
const { SingleCertSort } = require("../js/sort")
var cpUpload = upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'signature', maxCount: 1 }])
router.post("/", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin, Roles.Issuer]), cpUpload, async (req, res) => {

    var u1 = await user.findById(req.user.uid)
    var logo = new files({
        binary: req.files.logo[0].buffer, mimetype: req.files.logo[0].mimetype,
        type: "logo"
    })
    var signature = new files({
        binary: req.files.signature[0].buffer, mimetype: req.files.signature[0].mimetype,
        type: "signature"
    })
    logo = await logo.save()
    signature = await signature.save()
    var obj = {
        title: req.body.title,
        description: req.body.description,
        name: req.body.name,
        email: req.body.email,
        instructor_name: req.body.instructor_name,
        logo: logo._id,
        signature: signature._id,
        issuedby: {
            issuer_name: u1.name,
            issuer_email: u1.email,
            org_name: u1.organization.name,
            org_id: u1.organization.id,
        },
        template_id: req.body.template_id,
        issue_date: Date.now()
    }
    if (req.body.expiry_date) {
        obj.expiry_date = req.body.expiry_date
    }
    try {
        var c1 = new cert(obj)
        var r1 = await c1.save()
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }
    //we need to set this process to transaction when replicaset is established in future so we can make sure data consistency
})
router.put("/:id", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin, Roles.Issuer]), cpUpload, async (req, res) => {
    try {
        var u1 = await user.findById(req.user.uid)
        var temp = {
            title: req.body.title,
            description: req.body.description,
            expiry_date: req.body.expiry_date,
            name: req.body.name,
            email: req.body.email,
            instructor_name: req.body.instructor_name,
            $push: {
                "updatedby": {
                    name: u1.name,
                    email: u1.email,
                }
            }

        }
        if (req.files.logo) {
            temp.logo = { image: req.files.logo[0].buffer.toString('base64'), mimetype: req.files.logo[0].mimetype }
        }
        if (req.files.signature) {
            temp.signature = { image: req.files.signature[0].buffer.toString('base64'), mimetype: req.files.signature[0].mimetype }
        }
        var r1 = await cert.findOneAndUpdate({ _id: req.params.id, 'issuedby.org_id': req.user.org_id, 'publish.status': false }, temp)
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }
})
router.get("/:id?", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin, Roles.Issuer]), async (req, res) => {

    if (req.params.id == null) {
        //for list read
        var perpage = 10
        var pageno = req.query.pageno
        let gq = new SingleSearch(req)
        let gqs = new SingleCertSort(req)
        var query = gq.GenerateQuery()
        var sort = gqs.GenerateSortQuery()
        if (isNaN(parseInt(pageno))) { pageno = 1 }
        var result = await cert.find(query, { logo: 0, signature: 0, certificate_img: 0 }).sort(sort).skip(pagination.Skip(pageno, perpage)).limit(perpage);
        var total = await cert.find(query).countDocuments();
        result = { "list": result, totalcount: total }
        res.json(result)
    } else {
        var result = null;
        if (req.query.edit) {
            //for edit view
            var query = { _id: req.params.id, 'issuedby.org_id': req.user.org_id, 'publish.status': false }
            result = await cert.findOne(query, { _id: 0, issue_date: 0 });
        } else {
            //for certificate view
            var query = { _id: req.params.id, 'issuedby.org_id': req.user.org_id }
            result = await cert.findOne(query);
        }
        if (result)
            res.json(result)
        else
            res.status(404).send()
    }
})
router.delete("/:id", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin, Roles.Issuer]), async (req, res) => {
    try {

        let c = await cert.findOneAndDelete({ _id: req.params.id, 'issuedby.org_id': req.user.org_id, 'publish.status': false })
        await files.deleteMany({ _id: { $in: [c.logo._id, c.signature._id] } })
        console.log(req.user.name + "deleted")
        res.status(200).json({ message: "Deleted Sucessfully" })
    }
    catch (err) {
        res.send(err)
    }
})
router.get("/org_pub/:org_id/:id?", auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {
    //only super admin can useit to gather published certificate data of other orginzations
    if (req.params.id == null) {
        //for list read
        var perpage = 5
        var pageno = req.query.pageno
        var query = null
        var sort = null
        query = { 'issuedby.org_id': req.params.org_id, 'publish.status': true }
        sort = { "publish.publish_date": -1 }
        if (isNaN(parseInt(pageno))) { pageno = 1 }
        var result = await cert.find(query, { logo: 0, signature: 0, certificate_img: 0 }).sort(sort).skip(pagination.Skip(pageno, perpage)).limit(perpage);
        var total = await cert.find(query).countDocuments();
        result = { "list": result, totalcount: total }
        res.json(result)
    } else {
        var result = null;
        var query = { _id: req.params.id, 'issuedby.org_id': req.params.org_id }
        result = await cert.findOne(query);
        if (result)
            res.json(result)
        else
            res.status(404).send()
    }
})
module.exports = router