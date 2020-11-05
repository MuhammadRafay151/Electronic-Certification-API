const express = require('express');
var router = express.Router()
const user = require('../models/user');
const Auth = require('../Auth/Auth')

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
         var token = await Auth.generateAccessToken({ uid: response._id, roles: response.roles })
         res.json(token)
      }
   } catch (err) {
      res.send(err)
   }

});

router.put('/ManageUser',  async function (req, res) {
  
   try {
       var r1 = await user.findByIdAndUpdate(req.body.id,{
         status:req.body.status
      })
       res.json(r1)
   }
   catch (err) {
       res.json(err)
   }
   
});

module.exports = router