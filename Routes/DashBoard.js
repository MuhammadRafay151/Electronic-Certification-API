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


router.get("/userstats", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
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
    var UserStats = {
        TotalLimit: org.user_limit,
        Active: x[0].ActiveCount,
        Disabled: x[0].DisableCount,
        UnRegistered: org.user_limit - x[0].TotalCount,
    }
    res.json(UserStats)
})
router.get("/counthistory", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
    var CountHistory = await count.find({ Org_Id: req.user.org_id }, { _id: 0, date: 1, Count: 1 }).sort({ date: -1 }).limit(30);
    res.send(CountHistory)
})
router.get("/countstats", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
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
    var org = await organization.findOne({ _id: req.user.org_id })
    var CountStats = {
        TotalAllotedCount: TotalAllotedCount.length > 0 ? TotalAllotedCount[0].Count : 0,
        AvailableCount: org.ecertcount,
        TotalPublications: await PublishedCertCount(req.user.org_id)
    }
    res.json(CountStats)
})
router.get("/singlecreationhistory", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
    var temp = await SingleCreationHistory(req.user.org_id)
    res.json(temp)
})
router.get("/batchcreationhistory", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
    var temp = await BatchCreationHistory(req.user.org_id)
    res.json(temp)
})
router.get("/singlepublicationhistory", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
    var PublicationHistory = await SinglePublicationHistorys(req.user.org_id)
    res.json(PublicationHistory)
})
router.get("/batchpublicationhistory", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
    var PublicationHistory = await BatchPublicationHistorys(req.user.org_id)
    res.json(PublicationHistory)
})
router.get("/organizationstats", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
    var temp = (await OrganizationStats())[0]
    res.json(temp)
})
async function SingleCreationHistory(org_id) {
    var TotalSingle = await cert.aggregate([
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
    return TotalSingle
}
async function BatchCreationHistory(org_id) {
    var Batches = await batch.find({ "createdby.org_id": org_id }, { _id: 1 }).lean();
    var batchlist = []
    for (var x = 0; x < Batches.length; x++) {
        batchlist.push(Batches[x]._id.toString())
    }
    var TotalBatchCert = await bcert.aggregate([
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
    return TotalBatchCert
}
async function SinglePublicationHistorys(org_id) {
    var TotalSinglePublications = await cert.aggregate([
        { $match: { 'issuedby.org_id': org_id, 'publish.status': true } },
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
    return TotalSinglePublications
}
async function BatchPublicationHistorys(org_id) {
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
    return TotalBatchCertPublications
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
async function OrganizationStats() {
    var OrganizationStats = await organization.aggregate([{
        $facet: {
            TotalCount: [
                { $group: { _id: 0, Count: { $sum: 1 } } },
                { $project: { _id: 0, } }
            ],
            ActiveCount: [
                { $match: { "status.active": true } },
                { $group: { _id: 0, Count: { $sum: 1 } } },
                { $project: { _id: 0, } }
            ],
            DisableCount: [
                { $match: { "status.active": false } },
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
    }])
    return OrganizationStats
}
module.exports = router