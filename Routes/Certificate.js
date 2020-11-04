const express = require('express');

const router = express.Router()
const cert = require('../models/certificate');
//code goes here

router.post("/", async (req, res) => {

    var c1 = new cert({
        title: req.body.title,
        description: req.body.description,
        expiry_date: req.body.expiry_date,
        name: req.body.name,
        email: req.body.email,
        instructor_name: req.body.instructor_name,
        logo: req.body.logo,
        signature: req.body.signature,
        certificate_img: req.body.certificate_img,
        issuedby: {
            issuer_name: req.body.issuedby.issuer_name,
            issuer_email: req.body.issuedby.issuer_email,
            org_name: req.body.issuedby.org_name,
            org_id: req.body.issuedby.org_id,
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
        var r1 = await cert.findByIdAndUpdate(req.params.id,{
            title: req.body.title,
            description: req.body.description,
            expiry_date: req.body.expiry_date,
            name: req.body.name,
            email: req.body.email,
            instructor_name: req.body.instructor_name,
            logo: req.body.logo,
            signature: req.body.signature,
            certificate_img: req.body.certificate_img,
            $push:{"updatedby": {
                name: req.body.updatedby.name,
                email: req.body.updatedby.email,
            }}
           
        },)
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }
})
router.get("/:id?", async (req, res) => {
    if (req.params.id == null) {
        
        var result = await cert.find();
        res.json(result)
    } else {
        var result = await cert.find({ _id: req.params.id });
        res.json(result)
    }
})
router.delete("/:id", async (req, res) => {
    var c = await cert.findById(req.params.id)
    var delres = await c.deleteOne()
    res.status(200).send(delres)
})

module.exports = router