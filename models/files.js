const mongoose = require('mongoose')
const CertCount = mongoose.Schema({

    binary: { type: Buffer, required: true },
    mimetype: { type: String, required: true }

})

module.exports = mongoose.model("Files", CertCount)