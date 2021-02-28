const express = require("express")
const router = express.Router()
const Auth = require("../Auth/Auth")
const Roles = require("../js/Roles")
//use Auth.authenticateToken for after sigin functionality
//use Auth.CheckAuthorization for role based restrictions for example admin,superadmin

//example of protected url
router.get('/', Auth.authenticateToken, Auth.CheckAuthorization([Roles.Admin, Roles.SuperAdmin]), async (req, res) => {

})
//example of public url
router.get('/test', async (req, res) => {
    res.send("successful test")
})





module.exports = router
