const mongoose = require("mongoose");
const { Public, Private } = require("../Constants");
const Notification = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    audience: {
        enum: [Public, Private],
    },
    message: {
        type: String,
        required: true,
    },
    sceneBy: [mongoose.Schema.Types.ObjectId]
});
module.exports = mongoose.model("Notification", Notification);