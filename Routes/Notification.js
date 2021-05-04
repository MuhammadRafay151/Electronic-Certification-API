const express = require('express');
const router = express.Router()
const Roles = require('../js/Roles')
const Auth = require('../Auth/Auth')
const Notification = require('../models/notification');
const { ObjectID } = require("mongodb")
const { NotificationValidator } = require("../Validations");
const { validationResult } = require('express-validator');
router.get('/', Auth.authenticateToken, Auth.CheckAuthorization([Roles.Issuer, Roles.Admin,]),
    async (req, res) => {
        try {
            let response = await Notification.aggregate([
                { $match: { organizationId: new ObjectID(req.user.org_id) } },
                {
                    $project: {

                        message: 1,
                        Isread: {
                            $cond: [{ $in: [new ObjectID(req.user.uid), "$seenBy"] }, true, false]

                        },

                    }
                },
            ])
            response = { list: response, count: 0 }
            res.json(response);
        } catch (err) {
            console.log(err)
            res.status(500).send();
        }
    })
router.get('/unread/count', Auth.authenticateToken, Auth.CheckAuthorization([Roles.Issuer, Roles.Admin, Roles.SuperAdmin]),
    async (req, res) => {
        try {
            let response = await Notification.find({ organizationId: new ObjectID(req.user.org_id), seenBy: { $nin: new ObjectID(req.user.uid), } }).countDocuments();
            res.json({ count: response });

        } catch (err) {
            console.log(err)
            res.status(500).send();
        }
    })
router.patch('/', Auth.authenticateToken, Auth.CheckAuthorization([Roles.Issuer, Roles.Admin, Roles.SuperAdmin]),
    NotificationValidator,
    async (req, res) => {
        try {
            let errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            await Notification.updateOne({ _id: { $in: req.body.ids }, organizationId: req.user.org_id }, {
                $addToSet: { seenBy: req.user.uid }
            })
            res.status(200).send()
        } catch (err) {
            console.log(err)
            res.status(500).send();
        }
    })

module.exports = router
// $project: {
//     sceneBy: 0,
//     read: {
//         $cond: {
//             if: { '$sceneBy': { $nin: req.user.uid } },
//             then: true,
//             else: false
//         }
//     }
// }