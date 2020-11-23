const express = require('express');
const router = express.Router()
const organization = require('../models/organization');
const user = require('../models/user');
const count = require('../models/count')
var pagination = require('./../js/pagination');
const auth = require('../Auth/Auth')
const Roles = require('../js/Roles')

router.put('/', auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {
    console.log(req.body)
    var c1 = new count({
        IsIncrease: true,
        Count: req.body.count,
        Org_Id: req.body.Org_Id,
        by: {
            name: req.user.name,
            id: req.user.uid
        }
    })
    try {
        //needs to be wrap in transaction 
        var r1 = await organization.findByIdAndUpdate(req.body.Org_Id, {
            $inc: { ecertcount: parseInt(req.body.count) },

        }, { new: true })

        var r2 = await c1.save()
        res.json({org:r1,count:r2})
    }
    catch (err) {
        res.json(err)
    }

})

router.get("/:id?", auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {
    
    if (req.params.id == null) {
       
        var perpage = 5
        var pageno = req.query.pageno
        if (isNaN(parseInt(pageno))) { pageno = 1 }
        var result = await count.find(req.user.org_id, { },{ skip: pagination.Skip(pageno || 1, perpage), limit: perpage });
        if (pageno == 1) {
            var total = await count.find(req.user.org_id).countDocuments();
            result = { "list": result, totalcount: total }
        } else { result = { "list": result } }
        res.json(result)
    } else {
        
        var result = await count.find({ _id: req.params.id });
        res.json(result)
    }
})

router.get('/:id', auth.authenticateToken, auth.CheckAuthorization(["SuperAdmin"]), async (req, res) => {

    try {

        var r1 = await count.find({ Org_Id: req.params.id})
        res.json(r1)

    }
    catch (err) {
        res.json(err)
    }

})


module.exports = router