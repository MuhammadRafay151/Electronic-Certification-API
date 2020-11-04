const mongoose = require('mongoose')
const User = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
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
    roles:[]

})

module.exports = mongoose.model("User", User)