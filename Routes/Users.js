const express = require('express');
var router = express.Router()
const user = require('../models/user');
const Auth = require('../Auth/Auth')
const Roles = require('../js/Roles')
var pagination = require('./../js/pagination');
router.get("/", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin]), async (req, res) => {

})
router.get("/:org_id", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {
    try {
        var perpage = 5
        var pageno = req.query.pageno
        if (isNaN(parseInt(pageno))) { pageno = 1 }
        var sort = { name: 1 }
        var select={_id:1,name:1,email:1,register_date:1,status:1}
        var result = await user.find({ "organization.id": req.params.org_id },select).sort(sort).skip(pagination.Skip(pageno, perpage)).limit(perpage);
        if (result.length>0) {
            var total = await user.find({ "organization.id": req.params.org_id }).countDocuments()
            result = { "list": result, totalcount: total }
            res.json(result)
        } else {
            res.status(404).send()
        }
    } catch (err) {
        res.status(500).send()
    }
})

module.exports = router