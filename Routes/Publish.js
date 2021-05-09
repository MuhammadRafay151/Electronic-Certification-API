const express = require('express');
const router = express.Router()
const Auth = require('../Auth/Auth')
const Roles = require('../js/Roles')
const batch_cert = require('../models/batch_certificates')
const batch = require('../models/batch')
const cert = require('../models/certificate');
const MsgBroker = require("../MessageBroker/publisher")
const CountHandler = require("../js/CountHandler");
const config = require("config")
const { StatusCodeException } = require('../Exception/StatusCodeException');
const NotificationHandler = require("../js/NotificationHandler");
const Constants = require("../Constants");
const SocketSingleton = require("../js/Socket");
router.post("/single", Auth.authenticateToken, Auth.CheckAuthorization([Roles.Admin, Roles.Issuer]), async (req, res) => {
    try {
        await CountHandler.ReduceCount(req.user.org_id, 1);
        let publish = {
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
            res.send(`we are publishing your ${ct.title} certificate with id: ${ct._id}. You may continue what you are doing.`)

        }
        else {

            try {
                let crt = await cert.findOneAndUpdate({ _id: req.body.id, 'issuedby.org_id': req.user.org_id, 'publish.status': false }, { $set: { publish: publish } })
                if (crt) {
                    let message = `${crt.title} certificate with id: ${crt._id} has been published`;
                    await NotificationHandler.NewNotification(req.user, message, Constants.Private);
                    let unread = await NotificationHandler.UnReadCount(req.user);
                    new SocketSingleton().emitToUserId(req.user.uid, "NotificationAlert", { count: unread });
                    res.status(200).send(message)
                } else {
                    await CountHandler.IncreaseCount(req.user.org_id, 1);
                    res.status(404).send("certificate not found")
                }
            } catch (err) {
                await CountHandler.IncreaseCount(req.user.org_id, 1);
                console.log(err)
                res.status(500).send(err)
            }

        }
    } catch (err) {
        if (err instanceof StatusCodeException) {
            res.status(err.StatusCode).send(err.Message)
        } else {
            res.status(500).send(err)

        }
    }
})
router.post("/batch", Auth.authenticateToken, Auth.CheckAuthorization([Roles.Admin, Roles.Issuer]), async (req, res) => {
    try {
        let bt = await batch.findOne({ _id: req.body.id, 'createdby.org_id': req.user.org_id, 'publish.status': false })
        if (bt) {
            let bcert = await batch_cert.find({ batch_id: req.body.id }).countDocuments()
            if (bcert && bcert > 1) {
                await CountHandler.ReduceCount(req.user.org_id, bcert);
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
                    let publish = {
                        status: true,
                        publisher_name: req.user.name,
                        publisher_email: req.user.email,
                        publish_date: Date.now(),
                        processing: false
                    }
                    try {
                        await batch.findOneAndUpdate({ _id: req.body.id, 'createdby.org_id': req.user.org_id, 'publish.status': false }, { $set: { publish: publish } })
                        let message = `${bt.batch_name} batch with id: ${bt._id} has been published`;
                        await NotificationHandler.NewNotification(req.user, message, Constants.Private);
                        let unread = await NotificationHandler.UnReadCount(req.user);
                        new SocketSingleton().emitToUserId(req.user.uid, "NotificationAlert", { count: unread });
                        res.send(message)
                    } catch (err) {
                        await CountHandler.IncreaseCount(req.user.org_id, bcert);
                        res.status(500).send(err)
                    }
                }
            } else {
                res.status(409).send("batch must have more than 1 certificate to publish")
            }
        } else {
            return res.status(404).send("batch not found")
        }

    } catch (err) {
        if (err instanceof StatusCodeException) {
            res.status(err.StatusCode).send(err.Message)
        } else {
            res.status(500).send(err)

        }
    }
})
//blockchain exception raised count roll back implementation remaining
module.exports = router