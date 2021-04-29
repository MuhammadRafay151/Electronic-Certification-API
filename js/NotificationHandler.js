const Notification = require('../models/notification');
async function NewNotification(user, message, Audience) {
    //user is extracted from token
    let data = {
        UserId: user.uid,
        OrganizationId: user.org_id,
        Audience: Audience,
        Message: message,
    }
    let notification = new Notification(data);
    let response = await notification.save();
    return response;
}
module.exports = {
    NewNotification
}