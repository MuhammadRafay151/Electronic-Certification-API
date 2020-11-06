const express = require('express');
var router = express.Router()
const user = require('../models/user');
const Auth = require('../Auth/Auth')
var mongoose = require('mongoose');
router.post('/signup', async function (req, res) {

   var s1 = new user();
   s1.name = req.body.name
   s1.email = req.body.email
   s1.password = req.body.password
   s1.roles = req.body.roles
   s1.organization.name = req.body.organization.name
   s1.organization.id = req.body.organization.id
   try {
      var response = await s1.save()
      res.json({ message: response })
   }
   catch (err) {
      if (err.code == 11000) { err = { message: "email already registered" } }
      res.json({ message: err })
   }

});

router.post('/login', async function (req, res) {

   try {
      var response = await user.findOne({ email: req.body.email, password: req.body.password })
      if (response == null) {
         res.json({ message: "Invalid username or password" })
      }
      else {
         var token = await Auth.generateAccessToken({ uid: response._id,name:response.name, org_id: response.organization.id, roles: response.roles })
         delete response._doc.password
         response._doc.toke = token
         res.json(response)
      }
   } catch (err) {
      res.send(err)
   }

});

router.put('/active', Auth.authenticateToken, Auth.CheckAuthorization(["SuperAdmin", "admin"]), async function (req, res) {
   var flag = req.query.flag == 1
   var querry = null
   if (req.user.roles.includes("SuperAdmin")) {
      querry = {
         _id: mongoose.Types.ObjectId(req.body.id),

      }
   } else {
      querry = {
         _id: mongoose.Types.ObjectId(req.body.id),
         "organization.id": req.user.org_id

      }


   }
   try {

      var r1 = await user.findOneAndUpdate(querry, {
         status: { active: false }
      })
      if (r1)
         res.status(200).json({ active: flag })
      else
         res.status(404).send("user not found")
   }
   catch (err) {
      res.json(err)
   }

});

module.exports = router