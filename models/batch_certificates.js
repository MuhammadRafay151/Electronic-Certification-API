const mongoose = require('mongoose')
const batch_certificate = mongoose.Schema({
    batch_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    issue_date: {
        type: Date,
        default: Date.now()
    },
    issuedby: {
        name: {
            type: String,
            required: true
        }, email: {
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
})

module.exports = mongoose.model("batch_certificate", batch_certificate)