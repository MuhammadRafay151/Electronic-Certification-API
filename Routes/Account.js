const express = require('express');
var router=express.Router()
const user = require('../models/user');
const Auth=require('../Auth/Auth')

router.post('/signup',  async function (req, res) {
  
  var s1 = new user();
  s1.name=req.body.name
  s1.email=req.body.email
  s1.password=req.body.password
  try{
  var response= await s1.save()
   res.json({message:response})
  }  
  catch(err){
     res.json({message:err})
  }
  
});

router.post('/login',  async function (req, res) {
 
  try{
   var response =await user.findOne({name:req.body.name,password:req.body.password})
   if(response==null){
      res.json({message:"Invalid username or password"})
   }
   else{
      var token=await Auth.generateAccessToken({uid:response._id})
   res.json(token)
   }
  }catch(err){
   res.send(err)
  }
  
});


module.exports=router