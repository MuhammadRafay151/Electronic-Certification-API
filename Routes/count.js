const express = require('express');
const router = express.Router()
const organization = require('../models/organization');
const user = require('../models/user');
const count = require('../models/count')
var pagination = require('./../js/pagination');
const auth = require('../Auth/Auth')
const Roles = require('../js/Roles');
const { CountValidator } = require('../Validations');
const { validationResult } = require('express-validator');

router.put('/:orgid', auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin]), CountValidator,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            //needs to be wrap in transaction 
            let r1 = null;
            let cert_count = parseInt(req.body.count);
            let org = await organization.findOne({ _id: req.params.orgid });
            if (!org) {
                res.status(404).send("organzaition doesnot exist")
            }
            else if (cert_count < 0)//decrement
            {
                console.log(org)
                if (org.ecertcount - cert_count * -1 < 0) // mulitplying by -1 to remove the effect of - sign because we are sending '-' sign for which we are detetcing decrease request so in actually subtration it causes -*- =1 so that is the cause of wrong input
                    return res.status(409).send("count cannot be less than 0")
                r1 = await organization.updateOne({ _id: req.params.orgid, $expr: { $gte: [{ $subtract: ["$ecertcount", cert_count * -1] }, 0] } }, {
                    $inc: { ecertcount: cert_count },

                });
            } else {
                r1 = await organization.updateOne({ _id: req.params.orgid }, {
                    $inc: { ecertcount: cert_count },
                });
            }
            if (r1 && r1.nModified === 1) {
                var c1 = new count({
                    IsIncrease: cert_count > 0 ? true : false,
                    Count: cert_count,
                    Org_Id: req.params.orgid,
                    date: Date.now(),
                    by: {
                        name: req.user.name,
                        id: req.user.uid
                    }
                })
                var r2 = await c1.save()
                res.json(r2);
            }
            else {
                res.status(409).send("conflict while updating count")
            }

        }
        catch (err) {
            res.status(500).send(err)
        }

    })

router.get("/", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
    try {
        var perpage = 5
        var pageno = req.query.pageno
        if (isNaN(parseInt(pageno))) { pageno = 1 }
        let org = await organization.findOne({ _id: req.user.org_id });
        var result = await count.find({ Org_Id: req.user.org_id }).sort({ date: -1 }).skip(pagination.Skip(pageno, perpage)).limit(perpage);
        var total = await count.find({ Org_Id: req.user.org_id }).countDocuments();
        result = { "list": result, totalcount: total, available_balance: org.ecertcount }
        res.json(result)
    }
    catch (err) {
        res.status(500).send();
    }
})
router.get('/:id', auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {

    try {
        var perpage = 5
        var pageno = req.query.pageno
        if (isNaN(parseInt(pageno))) { pageno = 1 }
        let org = await organization.findOne({ _id: req.params.id });
        if (org) {
            var result = await count.find({ Org_Id: req.params.id }).sort({ date: -1 }).skip(pagination.Skip(pageno, perpage)).limit(perpage);
            var total = await count.find({ Org_Id: req.params.id }).countDocuments();
            result = { "list": result, totalcount: total, available_balance: org.ecertcount }
            res.json(result)
        } else {
            res.status(404).send("organization not found");
        }
    } catch (err) {
        res.status(500).send();
    }


})



module.exports = router