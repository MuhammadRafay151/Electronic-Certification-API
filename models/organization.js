const mongoose = require('mongoose')
const Organization = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    register_date: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    ecertcount: {
        type: Number,
        default: 0
    },
    user_limit: {
        type: Number,
        default: 1
    },
    phone: {
        type: String,
        require: true
    },
    country_code: {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: true
    },
    status: {
        active: {
            type: Boolean,
            default: true
        }
    }

})

module.exports = mongoose.model("Organization", Organization)