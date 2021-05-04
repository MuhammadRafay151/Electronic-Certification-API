const mongoose = require("mongoose");
const { Success, Error, Pending } = require("../Constants");
const Logs = mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [Success, Error, Pending],
    }
});
module.exports = mongoose.model("Logs", Logs);