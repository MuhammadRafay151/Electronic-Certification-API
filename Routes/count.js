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

    try {
        //needs to be wrap in transaction 
        var r1 = await organization.findOneAndUpdate({ id: req.body.id }, {
            $inc: { ecertcount: parseInt(req.body.count) },

        }, { new: true })

        if (r1) {
            var c1 = new count({
                IsIncrease: true,
                Count: req.body.count,
                Org_Id: req.body.id,
                date: Date.now(),
                by: {
                    name: req.user.name,
                    id: req.user.uid
                }
            })
            var r2 = await c1.save()
        }
        res.status(200).send("Count Incremented successfully")
    }
    catch (err) {
        res.json(err)
    }

})

router.get("/", auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {
    var perpage = 5
    var pageno = req.query.pageno
    if (isNaN(parseInt(pageno))) { pageno = 1 }
    var result = await count.find({ Org_Id: req.user.org_id }).sort({ date: -1 }).skip(pagination.Skip(pageno, perpage)).limit(perpage);
    var total = await count.find(req.user.org_id).countDocuments();
    result = { "list": result, totalcount: total }
    res.json(result)
})

router.get('/:id', auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {

    var perpage = 5
    var pageno = req.query.pageno
    if (isNaN(parseInt(pageno))) { pageno = 1 }
    var result = await count.find({ Org_Id: req.params.id }).sort({ date: -1 }).skip(pagination.Skip(pageno, perpage)).limit(perpage);
    var total = await count.find({ Org_Id: req.params.id }).countDocuments();
    result = { "list": result, totalcount: total }
    res.json(result)

})


module.exports = router