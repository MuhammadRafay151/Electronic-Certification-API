const mongoose = require('mongoose')
const batch = mongoose.Schema({
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
    created_date: {
        type: Date,
        default: Date.now()
    },
    instructor_name: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    signature: {
        type: String,
        required: true
    },

    createdby: {
        name: {
            type: String,
            required: true
        }, email: {
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
        }
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

module.exports = mongoose.model("batch", batch)