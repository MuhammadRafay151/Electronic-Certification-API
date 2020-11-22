const express = require('express');
const auth = require('../Auth/Auth')
const router = express.Router()
const cert = require('../models/certificate');
const user = require('../models/user')
var multer = require('multer')
var upload = multer()
var pagination = require('./../js/pagination');
const Roles = require('../js/Roles')

var cpUpload = upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'signature', maxCount: 1 }])
router.post("/", auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), cpUpload, async (req, res) => {

    var u1 = await user.findById(req.user.uid)
    var c1 = new cert({
        title: req.body.title,
        description: req.body.description,
        expiry_date: req.body.expiry_date,
        name: req.body.name,
        email: req.body.email,
        instructor_name: req.body.instructor_name,
        logo: { image: req.files.logo[0].buffer.toString('base64'), mimetype: req.files.logo[0].mimetype },
        signature: { image: req.files.signature[0].buffer.toString('base64'), mimetype: req.files.signature[0].mimetype },
        issuedby: {
            issuer_name: u1.name,
            issuer_email: u1.email,
            org_name: u1.organization.name,
            org_id: u1.organization.id,
        },
        template_id: req.body.template_id,
        issue_date:Date.now()
    })

    try {
        var r1 = await c1.save()
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }

})
router.put("/:id", auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), cpUpload, async (req, res) => {
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
        var r1 = await cert.findByIdAndUpdate(req.params.id, temp)
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }
})
router.get("/:id?", auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {

    if (req.params.id == null) {
        var perpage = 5
        var pageno = req.query.pageno
        if (isNaN(parseInt(pageno))) { pageno = 1 }
        var result = await cert.find({ 'issuedby.org_id': req.user.org_id }, { logo: 0, signature: 0, certificate_img: 0 }, { skip: pagination.Skip(pageno || 1, perpage), limit: perpage });
        if (pageno == 1) {
            var total = await cert.find({ 'issuedby.org_id': req.user.org_id }).countDocuments();
            result = { "list": result, totalcount: total }
        } else { result = { "list": result } }
        res.json(result)
    } else {
        var result = null;
        if (req.query.edit) {
            result = await cert.findOne({ _id: req.params.id, 'issuedby.org_id': req.user.org_id }, { _id: 0, issue_date: 0 });
        } else {
            result = await cert.findOne({ _id: req.params.id, 'issuedby.org_id': req.user.org_id });
        }
        res.json(result)
    }
})
router.delete("/:id", auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {
    try {

        var c = await cert.findOneAndDelete({ _id: req.params.id, 'issuedby.org_id': req.user.org_id })
        console.log(req.user.name + "deleted")
        res.status(200).json({ message: "Deleted Sucessfully" })
    }
    catch (err) {
        res.send(err)
    }
})

module.exports = router