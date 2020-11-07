const express = require('express');
const router = express.Router()
const organization = require('../models/organization');
const user = require('../models/user');
const count = require('../models/count')
const auth = require('../Auth/Auth')

router.put('/', auth.authenticateToken, auth.CheckAuthorization(["SuperAdmin"]), async (req, res) => {
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