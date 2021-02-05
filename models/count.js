const mongoose = require('mongoose')
const CertCount = mongoose.Schema({

    date: {
        type: Date,
    },
    IsIncrease: {
        type: Boolean,
        required:true
    },
    Count: {
        type: Number,
        required: true
    },
    Org_Id: {
        type: String,
        required: true
    },
    by:{
        name:{type:String,required:true},
        id:{type:String,required:true}
    }


})

module.exports = mongoose.model("CertCount", CertCount)