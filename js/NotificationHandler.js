const Notification = require('../models/notification');
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
module.exports = {
    NewNotification
}