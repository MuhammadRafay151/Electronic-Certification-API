const express = require('express');
const router = express.Router()
const Auth = require('../Auth/Auth')
const batch_cert = require('../models/batch_certificates')
const batch = require('../models/batch')
const user = require('../models/user')
var mongoose = require('mongoose');
const Roles = require('../js/Roles')
const pagination = require('../js/pagination')
//api handle requests to manipulate certificates in batches.
router.get("/:batch_id/:cert_id?", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {
    try {
        var temp = await batch.exists({ _id: req.params.batch_id, 'createdby.org_id': req.user.org_id });
        if (req.params.cert_id == null && temp) {
            var perpage = 5
            var pageno = req.query.pageno
            if (isNaN(parseInt(pageno))) { pageno = 1 }
            var result = await batch_cert.find({ batch_id: req.params.batch_id }).skip(pagination.Skip(pageno || 1, perpage)).limit(perpage);
            if (pageno == 1) {
                var total = await batch_cert.find({ batch_id: req.params.batch_id }).countDocuments();
                result = { "list": result, totalcount: total }
            } else { result = { "list": result } }
            res.json(result)
        }
        else if (temp) {
            var result = await batch_cert.find({ _id: req.params.cert_id, batch_id: req.params.batch_id });
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
        var u1 = await user.findById(req.user.uid)
        var b1 = await batch.findById(req.body.batch_id)
        if (b1.createdby.org_id == u1.organization.id) {
            var result = await batch_cert.findOneAndUpdate({ batch_id: req.body.batch_id, _id: mongoose.Types.ObjectId(req.body.cert_id) }, {

                name: req.body.name,
                email: req.body.email,
                $push: {
                    updatedby: {
                        name: u1.name,
                        email: u1.email,

                    }
                }

            }, { new: true })

            res.json(result)

        } else {
            res.status(403).send("you don't have permisison to update that resource")
        }

    }
    catch (err) {
        res.json(err)
    }

})
router.delete("/", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {
    var u1 = req.user.org_id
    var b1 = await batch.findById(req.body.batch_id)
    if (b1.createdby.org_id == u1) {
        var result = await batch_cert.findOneAndDelete({ batch_id: req.body.batch_id, _id: mongoose.Types.ObjectId(req.body.cert_id) })
        res.json(result)
    }
    else {
        res.status(403).send("you don't have permisison to delete that resource")
    }
})

function process_batch(data, req) {
    var list = []
    var error = []
    for (var i = 0; i < data.length; i++) {
        if (data[i].name && data[i].email) {
            list.push({
                batch_id: req.body.batch_id,
                name: data[i].name,
                email: data[i].email,
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
