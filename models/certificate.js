const mongoose = require('mongoose')
const certificate = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    default_template: {
        type: String,
        required: true
    },
    template: {
        type: String,
        required: true
    },
    expiry_date: {
        type: Date,
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
        type: String, required: false
    },
    logo: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    signature: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
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
    publish: {
        status: { type: Boolean, default: false },
        processing: { type: Boolean, default: false },
        publisher_name: { type: String },
        publisher_email: { type: String },
        publish_date: { type: Date }
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