const Notification = require('../models/notification');
const { ObjectID } = require("mongodb")
async function NewNotification(user, message, audience) {
    //user is extracted from token
    let data = {
        userId: user.uid,
        organizationId: user.org_id,
        audience: audience,
        message: message,
        date: Date.now(),
    }
    let notification = new Notification(data);
    let response = await notification.save();
    return response;
}
async function UnReadCount(user) {
    let response = await Notification.find({ organizationId: new ObjectID(user.org_id), seenBy: { $nin: new ObjectID(user.uid), } }).countDocuments();
    return response;
}
module.exports = {
    NewNotification,
    UnReadCount
}