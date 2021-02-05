const mongoose = require('mongoose')
const CertCount = mongoose.Schema({
    type: { type: "string", enum: ['logo', 'signature'], },
    binary: { type: Buffer, required: true },
    mimetype: { type: String, required: true }

})

module.exports = mongoose.model("Files", CertCount)