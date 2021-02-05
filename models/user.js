const mongoose = require('mongoose')
const User = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    organization: {
        name: { type: String },
        id: { type: String },

    },
    roles: [],
    status: {
        active: { type: Boolean, default: true },

    },
    register_date: { type: Date },
    phone: {
        type: String,
    },
    country_code: {
        type: String,
    },
    address: {
        type: String,
    },
})

module.exports = mongoose.model("User", User)