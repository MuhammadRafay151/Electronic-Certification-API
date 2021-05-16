const express = require('express');
const router = express.Router()
const Roles = require('../js/Roles')
const Auth = require('../Auth/Auth')
const Notification = require('../models/notification');
const { ObjectID } = require("mongodb")
const { NotificationValidator } = require("../Validations");
const { validationResult } = require('express-validator');
const NotificationHandler = require("../js/NotificationHandler");
const { Private, Public } = require("../Constants/");
router.get('/', Auth.authenticateToken, Auth.CheckAuthorization([Roles.Issuer, Roles.Admin,]),
    async (req, res) => {
        try {
            let response = await Notification.aggregate([
                {
                    $facet: {
                        "private": [
                            { $match: { organizationId: new ObjectID(req.user.org_id), audience: Private, userId: new ObjectID(req.user.uid) } },
                            {
                                $project: {
                                    date: 1,
                                    message: 1,
                                    Isread: {
                                        $cond: [{ $in: [new ObjectID(req.user.uid), "$seenBy"] }, true, false]

                                    },

                                }
                            },
                        ],
                        "public": [
                            { $match: { organizationId: new ObjectID(req.user.org_id), audience: Public, userId: { $ne: new ObjectID(req.user.uid) } } },
                            {
                                $project: {
                                    date: 1,
                                    message: 1,
                                    Isread: {
                                        $cond: [{ $in: [new ObjectID(req.user.uid), "$seenBy"] }, true, false]

                                    },

                                }
                            },
                        ]
                    }
                },
                {$project:{"result": {$concatArrays:["$private","$public"]}}},
                {$unwind:{path:"$result"}},
                {$replaceRoot:{newRoot:"$result"}},
                { $sort : { date : -1 } }
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
            let response = await NotificationHandler.UnReadCount(req.user);
            res.json({ count: response[0].TotalCount });

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
