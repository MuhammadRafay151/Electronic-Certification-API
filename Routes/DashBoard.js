const express = require('express');
const router = express.Router()
const organization = require('../models/organization');
const user = require('../models/user');
const count = require('../models/count')
const cert = require('../models/certificate')
const batch = require('../models/batch')
const bcert = require('../models/batch_certificates')
const auth = require('../Auth/Auth')
const Roles = require('../js/Roles');
const batch_certificates = require('../models/batch_certificates');


router.get("/", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
    var x = await user.aggregate([{
        $facet: {
            TotalCount: [
                { $match: { "organization.id": req.user.org_id } },
                { $group: { _id: 0, Count: { $sum: 1 } } },
                { $project: { _id: 0, } }
            ],
            ActiveCount: [
                { $match: { "organization.id": req.user.org_id, "status.active": true } },
                { $group: { _id: 0, Count: { $sum: 1 } } },
                { $project: { _id: 0, } }
            ],
            DisableCount: [
                { $match: { "organization.id": req.user.org_id, "status.active": false } },
                { $group: { _id: 0, Count: { $sum: 1 } } },
                { $project: { _id: 0, } }
            ]
        }

    },
    {
        "$project": {
            "TotalCount": {
                "$ifNull": [{ "$arrayElemAt": ["$TotalCount.Count", 0] }, 0]
            },
            "ActiveCount": {
                "$ifNull": [{ "$arrayElemAt": ["$ActiveCount.Count", 0] }, 0]
            },
            "DisableCount": {
                "$ifNull": [{ "$arrayElemAt": ["$DisableCount.Count", 0] }, 0]
            }
        }
    }
    ])
    var org = await organization.findOne({ _id: req.user.org_id })
    var userstats = {
        TotalLimit: org.user_limit,
        Active: x[0].ActiveCount,
        Disabled: x[0].DisableCount,
        UnRegistered: org.user_limit - x[0].TotalCount,
    }
    var CountHistory = await count.find({ Org_Id: req.user.org_id }, { _id: 0, date: 1, Count: 1 }).sort({ date: -1 }).limit(30);

    var TotalAllotedCount = await count.aggregate([
        { $match: { Org_Id: req.user.org_id } },
        {

            $group:
            {
                _id: null,
                Count: { $sum: "$Count" }

            },

        },
        {
            $project: {
                _id: 0,
                Count: 1
            }
        }
    ]);

    var CountStats = {
        TotalAllotedCount: TotalAllotedCount.length > 0 ? TotalAllotedCount[0].count : 0,
        AvailableCount: org.ecertcount,
        TotalPublications: await PublishedCertCount(req.user.org_id)
    }

    var Dashboard = {
        UserStats: userstats,
        CountHistory: CountHistory,
        CountStats: CountStats,
        CreationStats: await CreationStats(req.user.org_id)
    }
    res.json(Dashboard)
})
async function CreationStats(org_id) {
    var TotalSinglePublications = await cert.aggregate([
        { $match: { 'issuedby.org_id': org_id } },
        {
            $group: {
                _id: {
                    day: { $dayOfMonth: "$issue_date" },
                    month: { $month: "$issue_date" },
                    year: { $year: "$issue_date" }
                }, Count: { $sum: 1 }, date: { $first: '$issue_date' }
            }
        },
        { $project: { _id: 0, } },
        { $sort: { date: -1 } },
        { $limit: 14 }
    ])
    var Batches = await batch.find({ "createdby.org_id": org_id, 'publish.status': true }, { _id: 1 }).lean();
    var batchlist = []
    for (var x = 0; x < Batches.length; x++) {
        batchlist.push(Batches[x]._id.toString())
    }
    var TotalBatchCertPublications = await bcert.aggregate([
        { $match: { 'batch_id': { $in: batchlist } } },
        {
            $group: {
                _id: {
                    day: { $dayOfMonth: "$issue_date" },
                    month: { $month: "$issue_date" },
                    year: { $year: "$issue_date" }
                }, Count: { $sum: 1 }, date: { $first: '$issue_date' }
            }
        },
        { $project: { _id: 0, } },
        { $sort: { date: -1 } },
        { $limit: 14 }
    ])
    return { TotalSinglePublications, TotalBatchCertPublications}
}
async function PublishedCertCount(org_id) {
    var TotalSinglePublications = await cert.find({ 'issuedby.org_id': org_id, 'publish.status': true }).countDocuments();
    var PublishedBatches = await batch.find({ "createdby.org_id": org_id, 'publish.status': true });
    var TotalBatchPublications = 0
    for (var x = 0; x < PublishedBatches.length; x++) {
        var temp = await bcert.find({ batch_id: PublishedBatches[x]._id }).countDocuments();
        TotalBatchPublications += temp
    }
    var count = TotalSinglePublications + TotalBatchPublications
    return count
}
module.exports = router