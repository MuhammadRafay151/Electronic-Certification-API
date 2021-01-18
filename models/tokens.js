const mongoose = require('mongoose')
const Token = mongoose.Schema({
    token: {
        type: String,
        required: true
    },
})
module.exports = mongoose.model("Token", Token)