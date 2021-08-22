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
const LogHandler = require("../js/logsHandler");
router.post("/single", Auth.authenticateToken, Auth.CheckAuthorization([Roles.Admin, Roles.Issuer]), async (req, res) => {
    try {
        await CountHandler.ReduceCount(req.user.org_id, 1);
        if (req.app.get("BlockChain_Enable")) {
            return await PublishSingleBlockChain(req, res);
        }
        else {
            return await PublishSingleDB(req, res)
        }
    } catch (err) {
        if (err instanceof StatusCodeException) {
            if (err?.CustomErrorCode === Constants.PublishFailed) {
                await CountHandler.IncreaseCount(req.user.org_id, 1);
            }
            res.status(err.StatusCode).send(err.Message)
        } else {
            res.status(500).send(err)

        }
    }
})
router.post("/batch", Auth.authenticateToken, Auth.CheckAuthorization([Roles.Admin, Roles.Issuer]), async (req, res) => {
    let bcert = null;
    try {
        let bt = await batch.findOne({ _id: req.body.id, 'createdby.org_id': req.user.org_id, 'publish.status': false })
        if (bt) {
            bcert = await batch_cert.find({ batch_id: req.body.id }).countDocuments()
            if (bcert && bcert > 1) {
                await CountHandler.ReduceCount(req.user.org_id, bcert);
                if (req.app.get("BlockChain_Enable")) {
                    return await PublishBatchBlockChain(req, res)
                } else {
                    return await PublishBatchDB(req, res)
                }
            } else {
                throw new StatusCodeException(409, "batch must have more than 1 certificate to publish")
            }
        } else {
            throw new StatusCodeException(404, "batch not found")
        }
    } catch (err) {
        if (err instanceof StatusCodeException) {
            if (err?.CustomErrorCode === Constants.PublishFailed) {
                await CountHandler.IncreaseCount(req.user.org_id, bcert);
            }
            res.status(err.StatusCode).send(err.Message)
        } else {
            res.status(500).send(err)

        }
    }
})
async function PublishSingleBlockChain(req, res) {
    let ct = null;
    try {
        ct = await cert.findOneAndUpdate({ _id: req.body.id, 'issuedby.org_id': req.user.org_id, 'publish.status': false, 'publish.processing': false }, { $set: { 'publish.processing': true } }).lean()
    }
    catch (err) {
        throw new StatusCodeException(500, err, Constants.PublishFailed)
    }
    if (ct) {
        if (config.get("app.debugging") === true) {
            const io = req.app.get("socketio");
            ct.message = "send to message queue";
            io.to("debugging").emit("log", ct);
        }
        try {
            await LogHandler.Log(JSON.stringify(ct), Constants.Pending);
        } catch (err) {
            //empty catch
        }
        try {
            await MsgBroker.send(true, { user: req.user, certid: req.body.id })
            return res.send(`we are publishing your ${ct.title} certificate with id: ${ct._id}. You may continue what you are doing.`)
        } catch (err) {
            await cert.updateOne({ _id: req.body.id, 'issuedby.org_id': req.user.org_id, 'publish.status': false, 'publish.processing': true }, { $set: { 'publish.processing': false } })
            await LogHandler.Log(JSON.stringify(ct), Constants.Error, err);
            throw new StatusCodeException(503, "service unavailable", Constants.PublishFailed)
        }

    } else {
        throw new StatusCodeException(404, "certificate not found", Constants.PublishFailed)
    }

}
async function PublishSingleDB(req, res) {

    let crt = null;
    let publish = {
        status: true,
        publisher_name: req.user.name,
        publisher_email: req.user.email,
        publish_date: Date.now(),
        processing: false
    }
    try {
        crt = await cert.findOneAndUpdate({ _id: req.body.id, 'issuedby.org_id': req.user.org_id, 'publish.status': false }, { $set: { publish: publish } })
    } catch (err) {
        throw new StatusCodeException(500, err, Constants.PublishFailed)
    }
    if (crt) {
        let message = `${crt.title} certificate with id: ${crt._id} has been published`;
        let message2 = `${req.user.name} has published the certificate having title: ${crt.title} & id: ${crt._id}`;
        await Promise.all([
            await NotificationHandler.NewNotification(req.user, message, Constants.Private),
            await NotificationHandler.NewNotification(req.user, message2, Constants.Public)
        ])
        new SocketSingleton().emitToRoom(req.user.org_id, "NotificationAlert", { count: 1 });
        return res.status(200).send(message)
    } else {
        throw new StatusCodeException(400, "certificate not found", Constants.PublishFailed)
    }
}
async function PublishBatchBlockChain(req, res) {
    let bt = await batch.findOneAndUpdate({ _id: req.body.id, 'createdby.org_id': req.user.org_id, 'publish.status': false, 'publish.processing': false }, { $set: { 'publish.processing': true } }).lean();
    if (bt) {
        if (config.get("app.debugging") === true) {
            const io = req.app.get("socketio");
            bt.message = "send to message queue";
            io.to("debugging").emit("log", bt);
        }
        try {
            await LogHandler.Log(JSON.stringify(bt), Constants.Pending);
        } catch (err) { }
        try {
            await MsgBroker.send(false, { user: req.user, batchid: req.body.id })
            return res.send("Processing started we will notify u soon")
        } catch (err) {
            await batch.findOneAndUpdate({ _id: req.body.id, 'createdby.org_id': req.user.org_id, 'publish.status': false, 'publish.processing': true }, { $set: { 'publish.processing': false } }).lean();
            await LogHandler.Log(JSON.stringify(bt), Constants.Error, err);
            throw new StatusCodeException(503, "service unavailable", Constants.PublishFailed)
        }
    }
    else {
        throw new StatusCodeException(404, "batch not found", Constants.PublishFailed)
    }
}
async function PublishBatchDB(req, res) {

    let publish = {
        status: true,
        publisher_name: req.user.name,
        publisher_email: req.user.email,
        publish_date: Date.now(),
        processing: false
    }
    try {
        bt = await batch.findOneAndUpdate({ _id: req.body.id, 'createdby.org_id': req.user.org_id, 'publish.status': false }, { $set: { publish: publish } })

    } catch (err) {
        throw new StatusCodeException(500, err, Constants.PublishFailed)
    }
    if (bt) {
        let message = `${bt.title} batch with id: ${bt._id} has been published`;
        let message2 = `${req.user.name} has published the batch having title: ${bt.title} & id: ${bt._id}`;
        await Promise.all([
            await NotificationHandler.NewNotification(req.user, message, Constants.Private),
            await NotificationHandler.NewNotification(req.user, message2, Constants.Public)
        ])
        new SocketSingleton().emitToRoom(req.user.org_id, "NotificationAlert", { count: 1 });
        return res.send(message)
    } else {
        throw new StatusCodeException(404, "batch not found", Constants.PublishFailed);
    }

}
module.exports = router