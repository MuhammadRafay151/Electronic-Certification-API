const express = require('express');
const batch = require('../models/batch')
const router = express.Router()
const user = require('../models/user')
const Auth = require('../Auth/Auth')
const pagination = require('../js/pagination')
var multer = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})
var upload = multer({ storage: storage })
//create empty batches
router.get("/:id?", Auth.authenticateToken, Auth.CheckAuthorization(["SuperAdmin", "Admin", "Issuer"]), async (req, res) => {

    if (req.params.id == null) {
        var perpage = 5
        var pageno = req.query.pageno
        if (isNaN(parseInt(pageno))) { pageno = 1 }
        var result = await batch.find({ "createdby.org_id": req.user.org_id }).skip(pagination.Skip(pageno || 1, perpage)).limit(perpage);
        if (pageno == 1) {
            var total = await batch.find().countDocuments();
            result = { "list": result, totalcount: total }
        } else { result = { "list": result } }
        res.json(result)
    } else {
        var result = null
        if (req.query.edit) {
            result = await batch.findOne({ _id: req.params.id, 'createdby.org_id': req.user.org_id }, { _id: 0, created_date: 0 });
        } else {
            result = await batch.findOne({ _id: req.params.id, 'createdby.org_id': req.user.org_id });
        }

        res.json(result)
    }


})
var cpUpload = upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'signature', maxCount: 1 }])
router.post("/", Auth.authenticateToken, Auth.CheckAuthorization(["SuperAdmin", "Admin", "Issuer"]), cpUpload, async (req, res) => {
    var u1 = await user.findById(req.user.uid)
    var b1 = new batch({
        batch_name: req.body.batch_name,
        title: req.body.title,
        description: req.body.description,
        expiry_date: req.body.expiry_date,
        instructor_name: req.body.instructor_name,
        logo: { image: req.files.logo[0].filename, mimetype: req.files.logo[0].mimetype },
        signature: { image: req.files.signature[0].filename, mimetype: req.files.logo[0].mimetype },
        template_id: req.body.template_id,
        createdby: {
            name: u1.name,
            email: u1.email,
            org_name: u1.organization.name,
            org_id: u1.organization.id,
        }

    })
    try {
        var r1 = await b1.save()
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }

})
router.put("/:id", Auth.authenticateToken, Auth.CheckAuthorization(["SuperAdmin", "Admin", "Issuer"]), async (req, res) => {

    try {
        var r1 = await batch.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            description: req.body.description,
            expiry_date: req.body.expiry_date,
            instructor_name: req.body.instructor_name,
            logo: req.body.logo,
            signature: req.body.signature,
            $push: {
                "updatedby": {
                    name: req.body.updatedby.name,
                    email: req.body.updatedby.email,
                }
            }

        }, { new: true })
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }

})
router.delete("/:id", Auth.authenticateToken, Auth.CheckAuthorization(["SuperAdmin", "Admin", "Issuer"]), async (req, res) => {

    var result = await batch.findByIdAndDelete(req.params.id)
    res.status(200).send(result)

})

module.exports = router