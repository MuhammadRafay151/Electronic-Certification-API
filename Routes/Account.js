const express = require('express');
var router = express.Router()
const user = require('../models/user');
const Auth = require('../Auth/Auth')
const Roles = require('../js/Roles')
const organization = require('../models/organization')
const RFT = require('../models/tokens');
const { ChangePasswordValidatior } = require("../Validations")
const { validationResult } = require('express-validator');
const config = require('config');
router.post('/Register/:orgid', Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin]), async function (req, res, next) {
   try {
      var org = await organization.findOne({ _id: req.params.orgid })
      var TotalEnroll = await user.find({ "organization.id": req.params.orgid }).countDocuments()
      var roles = []
      if (org) {
         if (org.user_limit == TotalEnroll) {
            return res.status(400).send("User limit reached")
         }
         var Admin = await user.exists({ 'organization.id': org.id, roles: Roles.Admin })
         if (Admin && "AllowAdmin" in req.body && req.body.AllowAdmin === false) {
            roles = [Roles.Issuer]
         } else {
            roles = [Roles.Admin, Roles.Issuer]
         }
         var s1 = new user({
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            password: req.body.password,
            organization: {
               name: org.name,
               id: org._id
            },
            roles: roles,
            register_date: Date.now(),
            phone: req.body.phone,
            country_code: req.body.country_code,
            address: req.body.address,
         });
         var response = await s1.save()
         res.status(200).send("Registered Successfully")
      } else {
         res.status(404).send()
      }
   }
   catch (err) {
      // if (err.code == 11000) { err = { message: "email already registered" } }
      // res.json({ message: err })
      res.status(500).send(err)
   }
});
router.post('/Register', Auth.authenticateToken, Auth.CheckAuthorization([Roles.Admin]), async function (req, res, next) {
   try {
      var org = await organization.findOne({ _id: req.user.org_id })
      var TotalEnroll = await user.find({ "organization.id": req.user.org_id }).countDocuments()
      if (org) {
         if (org.user_limit == TotalEnroll && !req.user.roles.includes(Roles.SuperAdmin)) {
            return res.status(400).send("User limit reached")
         }
         let u1 = {
            name: req.body.name,
            email: req.body.email.toLowerCase(),
            password: req.body.password,
            organization: {
               name: org.name,
               id: org._id
            },
            roles: [Roles.Issuer],
            register_date: Date.now(),
            phone: req.body.phone,
            country_code: req.body.country_code,
            address: req.body.address,
         }
         if ("AllowAdmin" in req.body && req.body.AllowAdmin === true)//according to fyp poiunted issues
         {
            u1.roles.push(Roles.Admin);
         }
         let s1 = new user(u1);
         let response = await s1.save()
         res.status(200).send("Registered Successfully")
      } else {
         res.status(404).send()
      }
   }
   catch (err) {
      res.status(500).send(err)
   }
});
router.put('/UpdateProfile/:orgid', Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin]), async function (req, res, next) {
   try {
      let ModifiedUser = {
         name: req.body.name,
         email: req.body.email.toLowerCase(),
         phone: req.body.phone,
         country_code: req.body.country_code,
         address: req.body.address,
      }
      if ("AllowAdmin" in req.body && req.body.AllowAdmin === false) {
         ModifiedUser.$pull = { roles: Roles.Admin }

      } else {
         ModifiedUser.$addToSet = { roles: Roles.Admin }

      }
      var u1 = await user.findOneAndUpdate({ _id: req.body._id, 'organization.id': req.params.orgid }, ModifiedUser, { new: true })
      if (u1) {
         res.json(u1)
      } else {
         res.status(404).send()
      }
   }
   catch (err) {

      res.status(500).send(err)
   }
});
router.put('/UpdateProfile', Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin]), async function (req, res, next) {
   try {
      let ModifiedUser = {
         name: req.body.name,
         email: req.body.email.toLowerCase(),
         phone: req.body.phone,
         country_code: req.body.country_code,
         address: req.body.address,
      }
      if ("AllowAdmin" in req.body && req.body.AllowAdmin === false) {
         ModifiedUser.$pull = { roles: Roles.Admin }

      } else {
         ModifiedUser.$addToSet = { roles: Roles.Admin }

      }
      var u1 = await user.findOneAndUpdate({ _id: req.body._id, 'organization.id': req.user.org_id }, ModifiedUser, { new: true })
      if (u1) {
         res.json(u1)
      } else {
         res.status(404).send()
      }
   }
   catch (err) {
      res.status(500).send(err)
   }
});
router.post('/login', async function (req, res) {

   try {
      var response = await user.findOne({ email: req.body.email, password: req.body.password })
      if (response == null) {
         return res.status(401).json({ message: "Invalid username or password" })
      }
      if (!response.roles.includes(Roles.SuperAdmin)) {
         let org = await organization.findOne({ _id: response.organization.id })
         if (org === null) {
            return res.status(409).json({ message: "Organization does not exist " })
         } else if (org.status.active === false) {
            return res.status(409).json({ message: "Organization has been disabled " })
         }
      }
      if (response.status.active == true) {
         let token_data = { uid: response._id, email: response.email, name: response.name, roles: response.roles }
         if (response.organization) {
            token_data.org_id = response.organization.id
         }
         var token = await Auth.generateAccessToken(token_data)
         var RefreshToken = await Auth.generateRefreshToken(token_data)
         await new RFT({ token: RefreshToken, userid: response._id }).save()
         delete response._doc.password
         response._doc.token = token
         response._doc.RefreshToken = RefreshToken
         return res.json(response)
      } else {
         return res.status(409).json({ message: "Account has been disabled" })
      }
   } catch (err) {
      res.send(err)
   }

});
router.post('/refresh_token', async function (req, res) {

   try {
      var token = await RFT.findOne({ token: req.body.RefreshToken }).lean();
      if (token == null) {
         res.status(401).json({ message: "No token found" })
      } else {
         try {
            let result = await Auth.authenticateRefreshToken(token.token)
            let u1 = await user.findOne({ _id: result.uid })
            if (u1.status.active == true) {
               let token_data = { uid: u1._id, email: u1.email, name: u1.name, roles: u1.roles }
               if (u1.organization) {
                  token_data.org_id = u1.organization.id
               }
               var token = await Auth.generateAccessToken(token_data)
               res.json({ token })
            } else {
               await RFT.deleteOne({ token: req.body.RefreshToken })
               res.status(403).json({ message: "Account has been disabled" })
            }
         } catch (err) {
            await RFT.deleteOne({ token: req.body.RefreshToken })
            return res.status(403).send(err)
         }

      }
   } catch (err) {
      res.status(500).send()
   }
});
router.post('/sign_out', async function (req, res) {

   try {
      await RFT.deleteOne({ token: req.body.RefreshToken })
      res.send("signed out")
   }
   catch (err) {
      res.status(500).send()
   }
});

router.put('/togglestatus/:orgid/:userid', Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin]), async function (req, res) {
   try {
      if (req.user.uid == req.params.userid)
         return res.status(400).send("Cannot process this request")
      var r1 = await user.findOne({ _id: req.params.userid, 'organization.id': req.params.orgid })
      if (r1) {
         var r2 = await user.findOneAndUpdate({ _id: req.params.userid, 'organization.id': req.params.orgid }, { "$set": { status: { active: !r1.status.active } } })
         res.status(200).send("Status changed successfully")
      }
      else
         res.status(404).send()
   }
   catch (err) {
      res.status(500).send()
   }

});

router.put('/togglestatus/:userid', Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin]), async function (req, res) {
   try {
      if (req.user.uid == req.params.userid)
         return res.status(400).send("Cannot process this request")
      var r1 = await user.findOne({ _id: req.params.userid, 'organization.id': req.user.org_id })
      if (r1) {
         var r2 = await user.findOneAndUpdate({ _id: req.params.userid, 'organization.id': req.user.org_id }, { "$set": { status: { active: !r1.status.active } } })
         res.status(200).send("Status changed successfully")
      }
      else
         res.status(404).send()
   }
   catch (err) {
      res.status(500).send()
   }

});

router.get('/Available/:email', Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin]), async (req, res) => {
   try {
      var r1 = await user.exists({ email: req.params.email.toLowerCase() })
      res.json({ IsAvailable: !r1 })
   } catch {
      res.status(500).send()
   }
})
//
router.put('/password', Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin]),
   ChangePasswordValidatior, async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }
      let _new = req.body.new
      let confirm = req.body.confirm
      let current = req.body.current
      if (confirm !== _new) { return res.status(409).send("password should be identical") }
      try {
         let result = await user.findOneAndUpdate({ _id: req.user.uid, password: current }, { password: _new })
         if (result) {
            await RFT.deleteMany({ userid: req.user.uid })
            return res.status(200).send()
         }
         else {
            return res.status(409).send("Invalid password")
         }
      }
      catch (err) {
         return res.status(500).send(err)
      }
   })
// router.put('/resetpassword', async (req, res) => {
//    let _new = req.body.new
//    let confirm = req.body.confirm
//    let reset_token = req.body.reset_token
//    res.status(200).send()
// })
router.get('/resetpassword/:uid', Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin]),
   async (req, res) => {
      try {
         let response = null;
         if (req.user.roles.includes(Roles.SuperAdmin)) {
            response = await user.findOne({ _id: req.params.uid })

         } else {
            response = await user.findOne({ _id: req.params.uid, "organization.id": req.user.org_id })
         }
         if (!response)
            return res.status(404).send("user does not exist")
         let token = Auth.generatePrToken({ uid: response._id }, 300)
         let resetUrl = `${config.get("app.reset_url")}?token=${token}`
         res.send(resetUrl);
      } catch (err) {
         console.log(err)
         res.status(500).send();
      }
   })
module.exports = router