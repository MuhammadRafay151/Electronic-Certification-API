const mongoose = require('mongoose')
const Token = mongoose.Schema({
    userid: { type: String },
    token: {
        type: String,
        required: true
    },
})
module.exports = mongoose.model("Token", Token)