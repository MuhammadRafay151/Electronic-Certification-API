const express = require('express');
const router = express.Router()
const organization = require('../models/organization');
var pagination = require('./../js/pagination');

const auth = require('../Auth/Auth')
router.post('/', auth.authenticateToken, auth.CheckAuthorization(["SuperAdmin"]), async (req, res) => {

    var co1 = new organization({

        name: req.body.name,
        email: req.body.email,
        id: req.body.id
    })
    try {
        var r1 = await co1.save()
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }

})

router.put('/active',auth.authenticateToken, auth.CheckAuthorization(["SuperAdmin"]), async (req, res) => {
    var flag = req.query.flag == 1
    try {
        var r1 = await organization.findByIdAndUpdate(req.body.id, { status: {active:flag }},{new:true})
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }

})

//router.get('/', auth.authenticateToken, auth.CheckAuthorization(["SuperAdmin"]), async (req, res) => {
//router.get('/asd', async (req, res) => {

 //   try {
 //       var r1 = await organization.find()
 //       res.json(r1)
 //   }
 //   catch (err) {
  //      res.json(err)
  //  }
//})

router.get("/:id?", async (req, res) => {

    if (req.params.id == null) {
        var perpage = 5
        var pageno = req.query.pageno
        if (isNaN(parseInt(pageno))) { pageno = 1 }
        var result = await organization.find({}, { },{ skip: pagination.Skip(pageno || 1, perpage), limit: perpage });
        if (pageno == 1) {
            var total = await organization.find().countDocuments();
            result = { "list": result, totalcount: total }
        } else { result = { "list": result } }
        res.json(result)
    } else {
        var result = await organization.find({ _id: req.params.id });
        res.json(result)
    }
})

module.exports = router