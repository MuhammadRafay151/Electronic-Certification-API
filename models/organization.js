const mongoose = require('mongoose')
const Organization = mongoose.Schema({
    
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    id: {
        type: String,
        unique:true,
        required: true
    },
    ecertcount:{
        type: Number,
        default: 0
    },
    countupdate:{
        date: {
            type: Date,
            default: Date.now()
        },
        name:{
            type: String,
            required: true
        },
        email:{
            type: String,
            required: true
        },
        countadded:{
            type: Number
        }
    },
    status:{
        type: String,
        enum: ['enable', 'disable'],
        default: 'enable'
    }

})

module.exports = mongoose.model("Organization", Organization)