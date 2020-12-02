const express = require('express');
var router = express.Router()
const user = require('../models/user');
const Auth = require('../Auth/Auth')
var mongoose = require('mongoose');
const Roles = require('../js/Roles')
const organization = require('../models/organization')
router.post('/Register/:orgid', Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin]), async function (req, res, next) {
   try {
      var org = await organization.findOne({ id: req.params.orgid })
      var roles = []
      if (org) {
         var Admin = await user.exists({ 'organization.id': org.id, roles: Roles.Admin })
         if (Admin) {
            roles = [Roles.Issuer]
         } else {
            roles = [Roles.Admin, Roles.Issuer]
         }
         var s1 = new user({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            organization: {
               name: org.name,
               id: org.id
            },
            roles: roles,
            register_date: Date.now()
         });
         var response = await s1.save()
         res.json({ message: response })
      } else {
         res.status(404).send()
      }
   }
   catch (err) {
      // if (err.code == 11000) { err = { message: "email already registered" } }
      // res.json({ message: err })
      res.status(500).send()
   }
});
router.post('/Register', Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin]), async function (req, res, next) {
   try {
      var org = await organization.findOne({ id: req.user.org_id })
      if (org) {
         var s1 = new user({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            organization: {
               name: org.name,
               id: org.id
            },
            roles: [Roles.Issuer],
            register_date: Date.now()
         });
         var response = await s1.save()
         res.json({ message: response })
      } else {
         res.status(404).send()
      }
   }
   catch (err) {
      res.status(500).send()
   }
});

router.post('/login', async function (req, res) {

   try {
      var response = await user.findOne({ email: req.body.email, password: req.body.password })
      if (response == null) {
         res.status(401).json({ message: "Invalid username or password" })
      }
      else if (response.status.active == true) {
         var token = await Auth.generateAccessToken({ uid: response._id, email: response.email, name: response.name, org_id: response.organization.id, roles: response.roles })
         delete response._doc.password
         response._doc.token = token
         res.json(response)
      } else {
         res.status(403).json({ message: "Account has been disabled" })
      }
   } catch (err) {
      res.send(err)
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
      var r1 = await user.exists({ email: req.params.email })
      res.json({ IsAvailable: !r1 })
   } catch {
      res.status(500).send()
   }
})

module.exports = router