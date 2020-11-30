const express = require('express');
const router = express.Router()
const organization = require('../models/organization');
var pagination = require('./../js/pagination');
const Roles = require('../js/Roles')
const auth = require('../Auth/Auth')
router.post('/', auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {
    var org = new organization({
        name: req.body.name,
        email: req.body.email,
        id: req.body.id,
        register_date: Date.now()
    })
    try {
        var r1 = await org.save()
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }
})

router.put('/active', auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {
    var flag = req.query.flag == 1
    try {
        var r1 = await organization.findByIdAndUpdate(req.body.id, { status: { active: flag } }, { new: true })
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }

})

router.get("/", auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {

    var perpage = 5
    var pageno = req.query.pageno
    if (isNaN(parseInt(pageno))) { pageno = 1 }
    var result = await organization.find({id: { $nin: [req.user.org_id] }}, {}, { skip: pagination.Skip(pageno || 1, perpage), limit: perpage });
    var total = await organization.find().countDocuments();
    result = { "list": result, totalcount: total }
    res.json(result)
})
router.get("/:id", auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {

    var result = await organization.find({ _id: req.params.id });
    res.json(result)
})
module.exports = router