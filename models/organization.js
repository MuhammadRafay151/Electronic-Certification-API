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
        unique: true,
        required: true
    },
    ecertcount: {
        type: Number,
        default: 0
    },

    status: {
        active: {
            type: Boolean,
            default: true
        }
    }

})

module.exports = mongoose.model("Organization", Organization)