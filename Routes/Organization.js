const express = require('express');
const router = express.Router()
const organization = require('../models/organization');
const user = require('../models/user');

router.post('/CreatOrg',  async (req, res) => {
  
    var co1 = new organization({
        
       name:req.body.name,
       email:req.body.email,
       id:req.body.id
    })
    try {
        var r1 = await co1.save()
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }
    
})

router.put('/AddUser', async (req, res) => {
    try {
        var r1 = await user.findByIdAndUpdate(req.body.id,{
            "organization": {
                name:req.body.organization.name,
                id:req.body.organization.id
            },
            roles:req.body.roles
    
        })
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }
    
})

router.put('/ManageOrg',  async (req, res) => {
  
    try {
        var r1 = await organization.findByIdAndUpdate(req.body.id,{
            status:req.body.status
        })
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }
    
})

router.put('/AddCount', async (req, res) => {

    try {
        var r1 = await organization.findByIdAndUpdate(req.body.id,{
            $inc: { ecertcount:req.body.ecertcount},
            $push:{"countupdate": {
                date:Date.now(),
                name: req.body.countupdate.name,
                email: req.body.countupdate.email,
                countadded:req.body.ecertcount

            }}
        })
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }
    
})


router.get('/CountHistory/:id', async (req, res) => {

    try {
        var r1 = await organization.find({ _id: req.params.id },{ countupdate: 1});
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }
    
})


module.exports = router