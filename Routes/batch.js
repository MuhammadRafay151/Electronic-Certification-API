const express = require('express');
const batch = require('../models/batch')
const router = express.Router()
const user = require('../models/user')
const Auth = require('../Auth/Auth')
const pagination = require('../js/pagination')
const { BatchValidator,UpdateBatchValidator} = require("../Validations")
const { validationResult } = require('express-validator')

var multer = require('multer')
const path = require('path')
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads')
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//         cb(null, file.fieldname + '-' + uniqueSuffix)
//     }
// })
// var upload = multer({ storage: storage })
const files = require('../models/files')
const upload = multer({
    limits: {
        fileSize: 500000,
    },
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg'  && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
})
const Roles = require('../js/Roles')
const { BatchesSearch } = require("../js/search")
const { BatchCertSort } = require("../js/sort")
//create empty batches
router.get("/:id?", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {
    if (req.params.id == null) {
        var perpage = 10
        var pageno = req.query.pageno
        let gq = new BatchesSearch(req)
        let gqs = new BatchCertSort(req)
        var query = gq.GenerateQuery()
        var sort = gqs.GenerateSortQuery()
        if (isNaN(parseInt(pageno))) { pageno = 1 }
        var result = await batch.find(query).sort(sort).skip(pagination.Skip(pageno || 1, perpage)).limit(perpage);
        var total = await batch.find(query).countDocuments();
        result = { "list": result, totalcount: total }
        res.json(result)
    } else {
        var result = null
        if (req.query.edit) {
            var query = { _id: req.params.id, 'createdby.org_id': req.user.org_id, 'publish.status': false }

            result = await batch.findOne(query, { _id: 0, created_date: 0 });
        } else {
            var query = { _id: req.params.id, 'createdby.org_id': req.user.org_id }
            result = await batch.findOne(query);
        }
        res.json(result)
    }
})
var cpUpload = upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'signature', maxCount: 1 }])
router.post("/", Auth.authenticateToken, Auth.CheckAuthorization([Roles.Admin, Roles.Issuer]), cpUpload,BatchValidator, async (req, res) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
    }
    
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
        batch_name: req.body.batch_name,
        title: req.body.title,
        description: req.body.description,
        instructor_name: req.body.instructor_name,
        logo: logo._id,
        signature: signature._id,
        template_id: req.body.template_id,
        created_date: Date.now(),
        createdby: {
            name: u1.name,
            email: u1.email,
            org_name: u1.organization.name,
            org_id: u1.organization.id,
        }

    }
    if (req.body.expiry_date) {
        obj.expiry_date = req.body.expiry_date
    }
    try {
        var b1 = new batch(obj)
        var r1 = await b1.save()
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }
    //we need to set this process to transaction when replicaset is established in future so we can make sure data consistency
})
router.put("/:id", Auth.authenticateToken, Auth.CheckAuthorization([Roles.Admin, Roles.Issuer]) ,cpUpload,UpdateBatchValidator, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
    }

    try {
        var data = {
            title: req.body.title,
            description: req.body.description,
            expiry_date: req.body.expiry_date,
            instructor_name: req.body.instructor_name,
            $push: {
                "updatedby": {
                    name: req.user.name,
                    email: req.user.email,
                }
            }

        }
        if (req.files.logo) {
            data.logo = { image: req.files.logo[0].filename, mimetype: req.files.logo[0].mimetype }
        }
        if (req.files.signature) {
            data.signature = { image: req.files.signature[0].filename, mimetype: req.files.signature[0].mimetype }
        }
        var r1 = await batch.findOneAndUpdate({ _id: req.params.id, "createdby.org_id": req.user.org_id, 'publish.status': false }, data, { new: true })
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }

})
router.delete("/:id", Auth.authenticateToken, Auth.CheckAuthorization([Roles.Admin, Roles.Issuer]), async (req, res) => {

    try {
        let result = await batch.findOneAndDelete({ _id: req.params.id, "createdby.org_id": req.user.org_id, 'publish.status': false })
        await files.deleteMany({ _id: { $in: [result.logo._id, result.signature._id] } })
        res.status(200).send(result)
    } catch (err) {
        res.send(err)
    }

})
router.get("/org_pub/:org_id/", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {
    var perpage = 5
    var pageno = req.query.pageno
    var query = null
    var sort = null
    query = { "createdby.org_id": req.params.org_id, 'publish.status': true }
    sort = { "publish.publish_date": -1 }
    if (isNaN(parseInt(pageno))) { pageno = 1 }
    var result = await batch.find(query).sort(sort).skip(pagination.Skip(pageno || 1, perpage)).limit(perpage);
    var total = await batch.find(query).countDocuments();
    result = { "list": result, totalcount: total }
    res.json(result)
})
module.exports = router