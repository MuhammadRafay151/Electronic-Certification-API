const express = require('express');
const router = express.Router()
const organization = require('../models/organization');

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

router.get('/', auth.authenticateToken, auth.CheckAuthorization(["SuperAdmin"]), async (req, res) => {
    try {
        var r1 = await organization.find()
        res.json(r1)
    }
    catch (err) {
        res.json(err)
    }
})

module.exports = router