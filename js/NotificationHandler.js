const Notification = require('../models/notification');
const { ObjectID } = require("mongodb")
const { Private, Public } = require("../Constants")
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
    // let response = await Notification.find({ organizationId: new ObjectID(user.org_id), seenBy: { $nin: new ObjectID(user.uid), } }).countDocuments();
    let r = await Notification.aggregate([
        {
            $facet: {
                "private": [
                    { $match: { organizationId: new ObjectID(user.org_id), seenBy: { $nin: [new ObjectID(user.uid)] }, audience: Private, userId: new ObjectID(user.uid) } },
                    { $group: { _id: null, count: { $sum: 1 } } },
                    { $project: { _id: 0 } }
                ],
                "public": [
                    { $match: { organizationId: new ObjectID(user.org_id), seenBy: { $nin: [new ObjectID(user.uid)] }, audience: Public, userId: { $ne: new ObjectID(user.uid) } } },
                    { $group: { _id: null, count: { $sum: 1 } } },
                    { $project: { _id: 0 } }
                ]
            }
        },
        {
            $project: {
                "private": {
                    "$ifNull": [{ "$arrayElemAt": ["$private.count", 0] }, 0]
                },
                "public": {
                    "$ifNull": [{ "$arrayElemAt": ["$public.count", 0] }, 0]
                },
            }
        },
        { $project: { TotalCount: { $add: ["$private", "$public"] } } }
    ])
    return r;
}
module.exports = {
    NewNotification,
    UnReadCount
}