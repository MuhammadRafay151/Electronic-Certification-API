const express = require('express');
const batch = require('../models/batch')
const router = express.Router()
const Auth=require('../Auth/Auth')

router.get("/:id?",Auth.authenticateToken,Auth.CheckAuthorization(["admin","issuer"]),async (req, res) => {
    var b1=new batch()
    b1
    // if (req.params.id == null) {
        
    //     var result = await batch.find();
    //     res.json(result)
    // } else {
    //     var result = await batch.find({ _id: req.params.id });
    //     res.json(result)
    // }
    res.send("authroized")

})
router.post("/", async (req, res) => {
    var b1 = new batch({
        title: req.body.title,
        description: req.body.description,
        expiry_date: req.body.expiry_date,
        instructor_name: req.body.instructor_name,
        logo: req.body.logo,
        signature: req.body.signature,
        createdby: {
            name: req.body.createdby.issuer_name,
            email: req.body.createdby.issuer_email,
            org_name: req.body.createdby.org_name,
            org_id: req.body.createdby.org_id,
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
router.put("/:id", async (req, res) => {

    res.send("sdf")

})
router.delete("/:id", async (req, res) => {

    var result = await batch.findByIdAndDelete(req.params.id)
    res.status(200).send(result)

})

module.exports = router