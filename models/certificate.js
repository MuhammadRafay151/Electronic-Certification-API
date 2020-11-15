const mongoose = require('mongoose')
const certificate = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    expiry_date: {
        type: Date,
        required: false
    },
    issue_date: {
        type: Date,
        default: Date.now()
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    instructor_name: {
        type: String,
        required: true
    },
    logo: {
       image:{type:String,required:true},
       mimetype:{type:String,required:true}
    },
    signature: {
        image:{type:String,required:true},
        mimetype:{type:String,required:true}
    },
    issuedby: {
        issuer_name: {
            type: String,
            required: true
        }, issuer_email: {
            type: String,
            required: true
        },
        org_name: {
            type: String,
            required: true
        },
        org_id: {
            type: String,
            required: true
        },

    },
    updatedby: [
        {
            _id: false,
            Date: { type: Date, default: Date.now() },
            name: String,
            email: String
        }
    ],
    docType: {
        type: String,
        default: "certificate"
    },
    template_id: {
        type: String, required: true
    }

})

module.exports = mongoose.model("certificate", certificate)