const mongoose = require('mongoose')
const User = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique:true,
        index: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    organization:{
        name:{type:String,required:true},
        id:{type:String,required:true}
    },
    roles:[],
    status:{
       active:{type:Boolean,default:true},
        
    },
    register_date:{type:Date},
})

module.exports = mongoose.model("User", User)