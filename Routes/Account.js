const express = require('express');
var router=express.Router()

router.post("/authenticate",(req,res)=>{
   res.send("Valid")
})


module.exports=router