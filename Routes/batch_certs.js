const express = require('express');
const router = express.Router()
const Auth = require('../Auth/Auth')
const batch_cert = require('../models/batch_certificates')
const batch = require('../models/batch')
const user = require('../models/user')
var mongoose = require('mongoose');
//api handle requests to manipulate certificates in batches.
router.get("/:batch_id/:cert_id?", Auth.authenticateToken, Auth.CheckAuthorization(["admin", "issuer"]), async (req, res) => {

    if (req.params.cert_id == null) {

        var result = await batch_cert.find({ batch_id: req.params.batch_id });
        res.json(result)
    } else {

        var result = await batch_cert.find({ batch_id: req.params.batch_id, _id: mongoose.Types.ObjectId(req.params.cert_id) });
        res.json(result)
    }
})
router.post("/", Auth.authenticateToken, Auth.CheckAuthorization(["admin", "issuer"]), async (req, res) => {
    var u1 = await user.findById(req.user.uid)
    var b1 = new batch_cert({
        batch_id: req.body.batch_id,
        name: req.body.name,
        email: req.body.email,
        issuedby: {
            name: u1.name,
            email: u1.email,

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
router.put("/", Auth.authenticateToken, Auth.CheckAuthorization(["admin", "issuer"]), async (req, res) => {

    try {
        var u1 = await user.findById(req.user.uid)
        var b1 = await batch.findById(req.body.batch_id)
        if (b1.createdby.org_id == u1.organization.id) {
            var result =await batch_cert.findOneAndUpdate({ batch_id: req.body.batch_id, _id: mongoose.Types.ObjectId(req.body.cert_id) }, {

                name: req.body.name,
                email: req.body.email,
                $push:{updatedby: {
                    name: u1.name,
                    email: u1.email,

                }}

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
router.delete("/", Auth.authenticateToken, Auth.CheckAuthorization(["admin", "issuer"]), async (req, res) => {
    var u1 = req.user.org_id
    var b1 = await batch.findById(req.body.batch_id)
    if (b1.createdby.org_id == u1) {
        var result = await batch_cert.findOneAndDelete({ batch_id: req.body.batch_id, _id: mongoose.Types.ObjectId(req.body.cert_id) })
        res.json(result)
    }
    else{
        res.status(403).send("you don't have permisison to delete that resource")
    }
})

module.exports = router
