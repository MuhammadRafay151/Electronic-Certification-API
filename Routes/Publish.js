const express = require('express');
const router = express.Router()
const Auth = require('../Auth/Auth')
const Roles = require('../js/Roles')
const batch_cert = require('../models/batch_certificates')
const batch = require('../models/batch')
const cert = require('../models/certificate');
const MsgBroker = require("../MessageBroker/publisher")
const config = require("config")
router.post("/single", Auth.authenticateToken, Auth.CheckAuthorization([Roles.Admin, Roles.Issuer]), async (req, res) => {
    try {
        var publish = {
            status: true,
            publisher_name: req.user.name,
            publisher_email: req.user.email,
            publish_date: Date.now(),
            processing: false
        }
        if (req.app.get("BlockChain_Enable")) {
            let ct = await cert.findOneAndUpdate({ _id: req.body.id, 'issuedby.org_id': req.user.org_id, 'publish.status': false, 'publish.processing': false }, { $set: { 'publish.processing': true } }).lean()
            if (ct) {
                if (config.get("app.debugging") === true) {
                    const io = req.app.get("socketio");
                    ct.message = "send to message queue";
                    io.to("debugging").emit("log", ct);
                }
                await MsgBroker.send(true, { user: req.user, certid: req.body.id })

            }
            res.send("Processing started we will notify u soon")

        }
        else {
            var crt = await cert.findOneAndUpdate({ _id: req.body.id, 'issuedby.org_id': req.user.org_id, 'publish.status': false }, { $set: { publish: publish } })
            if (crt) {
                res.status(200).send("Published successfully")
            } else {
                res.status(404).send()
            }
        }
    } catch (err) {
        console.log(err)
        res.status(500).send()
    }
})
router.post("/batch", Auth.authenticateToken, Auth.CheckAuthorization([Roles.Admin, Roles.Issuer]), async (req, res) => {
    try {
        var bt = await batch.exists({ _id: req.body.id, 'createdby.org_id': req.user.org_id, 'publish.status': false })
        if (bt) {
            var bcert = await batch_cert.find({ batch_id: req.body.id }).countDocuments()
            if (bcert && bcert > 1) {
                if (req.app.get("BlockChain_Enable")) {
                    let bt = await batch.findOneAndUpdate({ _id: req.body.id, 'createdby.org_id': req.user.org_id, 'publish.status': false, 'publish.processing': false }, { $set: { 'publish.processing': true } }).lean();
                    if (bt) {
                        if (config.get("app.debugging") === true) {
                            const io = req.app.get("socketio");
                            bt.message = "send to message queue";
                            io.to("debugging").emit("log", bt);
                        }
                        await MsgBroker.send(false, { user: req.user, batchid: req.body.id })
                        res.send("Processing started we will notify u soon")
                    }
                    else
                        res.status(404).send()
                } else {
                    var publish = {
                        status: true,
                        publisher_name: req.user.name,
                        publisher_email: req.user.email,
                        publish_date: Date.now(),
                        processing: false
                    }
                    var bt = await batch.updateOne({ _id: req.body.id, 'createdby.org_id': req.user.org_id, 'publish.status': false }, { $set: { publish: publish } })
                    res.send("Batch Published...")
                }
            } else {
                res.status(409).send("batch must have more than 1 certificate to publish")
            }
        } else {
            return res.status(404).send("batch not found")
        }

    } catch (err) {
        res.status(500).send(err)
    }
})

module.exports = router