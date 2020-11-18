const mongoose = require('mongoose')
const batch = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    batch_name: {
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
        required: false
    },
    logo: {
        image: { type: String, required: true },
        mimetype: { type: String, required: true }
    },
    signature: {
        image: { type: String, required: true },
        mimetype: { type: String, required: true }
    },
    template_id: {
        type: String,
        required: false
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