const express = require('express');
const router = express.Router()
const Auth = require('../Auth/Auth')
const batch_cert = require('../models/batch_certificates')
const batch = require('../models/batch')
const Roles = require('../js/Roles')
const pagination = require('../js/pagination');
const { compile } = require('ejs');
//api handle requests to manipulate certificates in batches.
router.get("/:batch_id", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {
    try {
        var query = null
        if (req.query.pub) {
            query = { _id: req.params.batch_id, 'createdby.org_id': req.user.org_id, 'publish.status': true }
        } else {
            query = { _id: req.params.batch_id, 'createdby.org_id': req.user.org_id, 'publish.status': false }
        }
        var temp = await batch.findOne(query);
        if (temp) {
            var perpage = 5
            var pageno = req.query.pageno
            if (isNaN(parseInt(pageno))) { pageno = 1 }
            var result = await batch_cert.find({ batch_id: req.params.batch_id }).skip(pagination.Skip(pageno || 1, perpage)).limit(perpage);
            var total = await batch_cert.find({ batch_id: req.params.batch_id }).countDocuments();
            result = { "list": result, batch: temp, totalcount: total }
            res.json(result)
        }
        else {
            res.status(404).send()
        }
    } catch (err) {
        res.status(500).send("server error")
    }
})
router.post("/", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {

    var b1 = await batch.findById(req.body.batch_id)
    // batch_cert.insertMany(req.body)
    if (b1 && b1.createdby.org_id == req.user.org_id) {
        try {

            var r1 = process_batch(req.body.data, req)
            var x = await batch_cert.insertMany(r1.list)
            res.json({ data: x, error: r1.error })
        }
        catch (err) {
            res.json(err)
        }
    } else {
        res.status(404).send()
    }


})
router.put("/", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {
    try {
        var b1 = await batch.exists({ _id: req.body.batch_id, "createdby.org_id": req.user.org_id })
        if (b1) {
            var result = await batch_cert.findOneAndUpdate({ batch_id: req.body.batch_id, _id: req.body.id }, {
                name: req.body.name,
                email: req.body.email,
                $push: {
                    updatedby: {
                        name: req.user.name,
                        email: req.user.email,
                    }
                }
            }, { new: true })
            if (result) {
                return res.json(result)
            }
        }
        res.status(404).send()
    }
    catch (err) {
        res.json(err)
    }

})
router.delete("/:id/:batch_id", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {
    var temp = await batch.exists({ _id: req.params.batch_id, 'createdby.org_id': req.user.org_id });
    if (temp) {
        var result = await batch_cert.findOneAndDelete({ _id: req.params.id, batch_id: req.params.batch_id })
        res.json(result)
    }
    else {
        res.status(404).send("resource not found")
    }
})
router.get("/view/:id/:batch_id", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {
    var b1 = await batch.findOne({ _id: req.params.batch_id })
    var bcert = await batch_cert.findOne({ _id: req.params.id, batch_id: req.params.batch_id })
    if (b1 && bcert) {
        delete b1._doc.created_date
        b1._doc.issue_date = bcert.issue_date
        b1._doc._id = bcert._id
        b1._doc.name = bcert.name
        b1._doc.email = bcert.email
        //Object.assign({},b1)
        res.json(b1)
    } else {
        res.status(404).send()
    }
})
function process_batch(data, req) {
    var list = []
    var error = []
    var date = Date.now()
    for (var i = 0; i < data.length; i++) {
        if (data[i].name && data[i].email) {
            list.push({
                batch_id: req.body.batch_id,
                name: data[i].name,
                email: data[i].email,
                issue_date: date,
                issuedby: {
                    name: req.user.name,
                    email: req.user.email,

                }

            })
        } else {
            error.push(data[i])
        }
    }
    return { list, error }
}
module.exports = router
