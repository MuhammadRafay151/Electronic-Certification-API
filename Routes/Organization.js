const express = require('express');
const router = express.Router()
const organization = require('../models/organization');
var pagination = require('./../js/pagination');
const Roles = require('../js/Roles')
const auth = require('../Auth/Auth')
const user = require('../models/user');
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
router.put('/togglestatus', auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {
    try {
        var r1 = await organization.findOne({ id: req.body.id })
        if (r1) {
            var r2 = await organization.findOneAndUpdate({ id: req.body.id }, { "$set": { status: { active: !r1.status.active } } })
            res.status(200).send("Status changed successfully")
        } else {
            res.status(400).send()
        }
    }
    catch (err) {
        res.status(500).send()
    }

})
router.get("/", auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {

    var perpage = 5
    var pageno = req.query.pageno
    if (isNaN(parseInt(pageno))) { pageno = 1 }
    var result = await organization.find({ id: { $nin: [req.user.org_id] } }, {}, { skip: pagination.Skip(pageno || 1, perpage), limit: perpage });
    var total = await organization.find().countDocuments();
    result = { "list": result, totalcount: total }
    res.json(result)
})
router.get("/details", auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin]), async (req, res) => {
    try {
        var result = await organization.findOne({ id: req.user.org_id });
        if (result) {
            res.json(result)
        } else {
            res.status(404).send()
        }
    } catch (err) {
        res.status(500).send()
    }
})
router.get("/:id", auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {
    try {
        var result = await organization.findOne({ id: req.params.id });
        if (result) {
            res.json(result)
        } else {
            res.status(404).send()
        }
    } catch (err) {
        res.status(500).send()
    }
})
router.put("/UserLimit/:orgid", async (req, res) => {
    try {
        if (!req.body.count)
            res.status(400).send()
        var total = await user.find({ "organization.id": req.params.org_id }).countDocuments()
        if (parseInt(req.body.count) < total)
            res.status(400).send(`Error: Count should be greater then total enrolled users:${total}`)
        var r2 = await organization.findOneAndUpdate({ id: req.params.orgid }, { user_limit: req.body.count })
        if (r2) {
            res.status(200).send("Limit Updated")
        } else {
            res.status(404).send()
        }
    }
    catch (err) {
        res.status(500).send()
    }
})



module.exports = router