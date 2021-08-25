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

router.get("/userstats", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
    let x = await user.aggregate([{
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
    let CountHistory = await count.find({ Org_Id: req.user.org_id }, { _id: 0, date: 1, Count: 1 }).sort({ date: 1 }).limit(30);
    res.send(CountHistory)
})
router.get("/countstats", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
    let TotalAllotedCount = await count.aggregate([
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
    let org = await organization.findOne({ _id: req.user.org_id })
    let CountStats = {
        TotalAllotedCount: TotalAllotedCount.length > 0 ? TotalAllotedCount[0].Count : 0,
        AvailableCount: org.ecertcount,
        TotalPublications: await PublishedCertCount(req.user.org_id)
    }
    res.json(CountStats)
})
router.get("/singlecreationhistory", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
    let temp = await SingleCreationHistory(req.user.org_id)
    res.json(temp)
})
router.get("/batchcreationhistory", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
    let temp = await BatchCreationHistory(req.user.org_id)
    res.json(temp)
})
router.get("/singlepublicationhistory", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
    let PublicationHistory = await SinglePublicationHistorys(req.user.org_id)
    res.json(PublicationHistory)
})
router.get("/batchpublicationhistory", auth.authenticateToken, auth.CheckAuthorization([Roles.Admin]), async (req, res) => {
    let PublicationHistory = await BatchPublicationHistorys(req.user.org_id)
    res.json(PublicationHistory)
})
router.get("/organizationstats", auth.authenticateToken, auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {
    let temp = (await OrganizationStats())[0]
    res.json(temp)
})
async function SingleCreationHistory(org_id) {
    let TotalSingle = await cert.aggregate([
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
        { $sort: { date: 1 } },
        { $limit: 14 }
    ])
    return TotalSingle
}
async function BatchCreationHistory(org_id) {
    let Batches = await batch.find({ "createdby.org_id": org_id }, { _id: 1 }).lean();
    let batchlist = []
    for (let x = 0; x < Batches.length; x++) {
        batchlist.push(Batches[x]._id)
    }
    let TotalBatchCert = await bcert.aggregate([
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
        { $sort: { date: 1 } },
        { $limit: 14 }
    ])
    return TotalBatchCert
}
async function SinglePublicationHistorys(org_id) {
    let TotalSinglePublications = await cert.aggregate([
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
        { $sort: { date: 1 } },
        { $limit: 14 }
    ])
    return TotalSinglePublications
}
async function BatchPublicationHistorys(org_id) {
    let Batches = await batch.find({ "createdby.org_id": org_id, 'publish.status': true }, { _id: 1 }).lean();
    let batchlist = []
    for (let x = 0; x < Batches.length; x++) {
        batchlist.push(Batches[x]._id)
    }
    let TotalBatchCertPublications = await bcert.aggregate([
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
        { $sort: { date: 1 } },
        { $limit: 14 }
    ])
    return TotalBatchCertPublications
}
async function PublishedCertCount(org_id) {
    let requests = [
        cert.find({ 'issuedby.org_id': org_id, 'publish.status': true }).countDocuments(),
        batch.aggregate([
            { $match: { "createdby.org_id": org_id, 'publish.status': true } },
            {
                $lookup:
                {
                    from: "batch_certificates",
                    localField: "_id",
                    foreignField: "batch_id",
                    as: "bcerts"
                }
            },
            { $unwind: "$bcerts" },
            { $group: { _id: null, count: { $sum: 1 } } },
            { $project: { _id: 0 } }
        ])
    ]
    let response = await Promise.all(requests);
    let TotalSinglePublications = response[0];
    let TotalBatchPublications = response[1].length > 0 ? response[1][0].count : 0;
    let count = TotalSinglePublications + TotalBatchPublications
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