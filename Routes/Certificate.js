const express = require('express');
const auth = require('../Auth/Auth')
const router = express.Router()
const cert = require('../models/certificate');
const user = require('../models/user')
var multer = require('multer')
var upload = multer()
var pagination = require('./../js/pagination');
const { response } = require('express');
router.post("/", auth.authenticateToken, auth.CheckAuthorization(["SuperAdmin", "Admin", "Issuer"]), upload.any(), async (req, res) => {

    var u1 = await user.findById(req.user.uid)
    var c1 = new cert({
        title: req.body.title,
        description: req.body.description,
        expiry_date: req.body.expiry_date,
        name: req.body.name,
        email: req.body.email,
        instructor_name: req.body.instructor_name,
        logo: req.files[0].buffer.toString('base64'),
        signature: req.files[1].buffer.toString('base64'),
        certificate_img: req.body.certificate_img,
        issuedby: {
            issuer_name: u1.name,
            issuer_email: u1.email,
            org_name: u1.organization.name,
            org_id: u1.organization.id,
        }

    })

    try {
        var r1 = await c1.save()
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }

})
router.put("/:id", async (req, res) => {


    try {
        var r1 = await cert.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            description: req.body.description,
            expiry_date: req.body.expiry_date,
            name: req.body.name,
            email: req.body.email,
            instructor_name: req.body.instructor_name,
            logo: req.body.logo,
            signature: req.body.signature,
            certificate_img: req.body.certificate_img,
            $push: {
                "updatedby": {
                    name: req.body.updatedby.name,
                    email: req.body.updatedby.email,
                }
            }

        })
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }
})
router.get("/:id?", async (req, res) => {

    if (req.params.id == null) {
        var perpage = 5
        var pageno = req.query.pageno
        if (isNaN(parseInt(pageno))) { pageno = 1 }
        var result = await cert.find({}, { logo: 0, signature: 0, certificate_img: 0 }, { skip: pagination.Skip(pageno || 1, perpage), limit: perpage });
        if (pageno == 1) {
            var total = await cert.find().countDocuments();
            result = { "list": result, totalcount: total }
        } else { result = { "list": result } }
        res.json(result)
    } else {
        var result = await cert.find({ _id: req.params.id });
        res.json(result)
    }
})
router.delete("/:id", async (req, res) => {
    try {

        var c = await cert.findById(req.params.id)
        var delres = await c.deleteOne()
        res.status(200).send(delres)
    }
    catch (err) {
        res.send(err)
    }
})

module.exports = router