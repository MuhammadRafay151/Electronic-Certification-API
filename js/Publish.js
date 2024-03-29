const BlockChainCert = require('./BlockChainCert')
const batch_cert = require('../models/batch_certificates')
const batch = require('../models/batch')
const cert = require('../models/certificate')
const files = require('../models/files')
const { singleInvoke, batchInvoke } = require('../BlockChain/invoke')
const config = require('config')
const NotificationHandler = require("./NotificationHandler");
const LogHandler = require("./logsHandler");
const Constants = require('../Constants');
const CountHandler = require('./CountHandler');
async function PublishBatch(obj) {
    let isBlockChainPublished = false
    let bt, bcert;
    try {
        let publish = {
            status: true,
            publisher_name: obj.user.name,
            publisher_email: obj.user.email,
            publish_date: Date.now()
        }
        bt = await batch.findOne({ _id: obj.batchid, 'createdby.org_id': obj.user.org_id, 'publish.status': false }).lean();
        if (config.get("app.debugging") === true) {
            process.send({ ...bt, message: "batch information", debugging: true });
        }
        bcert = await batch_cert.find({ batch_id: obj.batchid }).lean()
        if (config.get("app.debugging") === true) {
            process.send({ _id: bt._id, candidates: [...bcert], message: "batch candidates", debugging: true });
        }
        let fl = await files.find({ _id: { $in: [bt.logo, bt.signature] } }).lean()
        let logo = fl.find(obj => obj.type === "logo")
        let signature = fl.find(obj => obj.type === "signature")
        bt.logo = { image: Buffer.from(logo.binary.buffer).toString('base64'), mimetype: logo.mimetype }
        bt.signature = { image: Buffer.from(signature.binary.buffer).toString('base64'), mimetype: signature.mimetype }
        if (config.get("app.debugging") === true) {
            process.send({ ...bt, message: "Batch information after combining images", debugging: true });
        }
        let CryptoCert = await BlockChainCert.ProcessBatchCerts(bt, bcert, publish)
        if (config.get("app.debugging") === true) {
            process.send({ _id: bt._id, candidates: [...CryptoCert], message: "Candidates certificates after merging", debugging: true });
            process.send({ _id: bt._id, message: "Sending batch to the blockchain", debugging: true });

        }
        await batchInvoke(CryptoCert, obj.user.uid)
        isBlockChainPublished = true
        await batch.updateOne({ _id: obj.batchid, 'createdby.org_id': obj.user.org_id, 'publish.status': false, 'publish.processing': true }, { $set: { publish: { ...publish, processing: false } } })
        if (config.get("app.debugging") === true) {
            process.send({ _id: bt._id, message: "Batch has been published to the blockchain", debugging: true });
        }
        let message = `${bt.title} batch with id: ${bt._id} has been published`;
        let message2 = `${obj.user.name} has published the batch having title: ${bt.title} & id: ${bt._id}`;
        await Promise.all([
            NotificationHandler.NewNotification(obj.user, message, Constants.Private),
            NotificationHandler.NewNotification(obj.user, message2, Constants.Public),
            LogHandler.Log(JSON.stringify(bt), Constants.Success)
        ])
        return true
    }
    catch (err) {
        let failureCompensate = [
            batch.updateOne({ _id: obj.batchid, 'createdby.org_id': obj.user.org_id, 'publish.status': false, 'publish.processing': true }, { $set: { 'publish.processing': false } }),
            LogHandler.Log(JSON.stringify(bt), Constants.Error, err)
        ]
        if (!isBlockChainPublished) {
            failureCompensate.push(CountHandler.IncreaseCount(obj.user.org_id, bcert.length))
        }
        await Promise.all(failureCompensate)
        return false
    }

}
async function PublishSingle(obj) {
    let isBlockChainPublished = false
    let crt;
    try {
        let publish = {
            status: true,
            publisher_name: obj.user.name,
            publisher_email: obj.user.email,
            publish_date: Date.now(),
        }
        crt = await cert.findOne({ _id: obj.certid, 'issuedby.org_id': obj.user.org_id, 'publish.status': false }).lean()
        let fl = await files.find({ _id: { $in: [crt.logo, crt.signature] } }).lean()
        let logo = fl.find(obj => obj.type === "logo")
        let signature = fl.find(obj => obj.type === "signature")
        crt.logo = { image: Buffer.from(logo.binary.buffer).toString('base64'), mimetype: logo.mimetype }
        crt.signature = { image: Buffer.from(signature.binary.buffer).toString('base64'), mimetype: signature.mimetype }

        let CryptoCert = await BlockChainCert.GetBlockChainCert(crt, publish)
        if (config.get("app.debugging") === true) {
            let temp = { ...CryptoCert, message: "Final certificate", debugging: true };
            process.send(temp);
            process.send({ _id: crt._id, message: "Sending to blockchain", debugging: true });
        }
        await singleInvoke(CryptoCert, obj.user.uid);
        isBlockPublished = true;
        await cert.updateOne({ _id: obj.certid, 'issuedby.org_id': obj.user.org_id, 'publish.status': false, 'publish.processing': true }, { $set: { publish: { ...publish, processing: false } } })
        if (config.get("app.debugging") === true) {
            let temp = { _id: crt._id, message: "Successfully published on blockchain", debugging: true };
            process.send(temp);
        }
        let message = `${crt.title} certificate with id: ${crt._id} has been published`;
        let message2 = `${obj.user.name} has published the certificate having title: ${crt.title} & id: ${crt._id}`;
        await Promise.all([
            NotificationHandler.NewNotification(obj.user, message, Constants.Private),
            NotificationHandler.NewNotification(obj.user, message2, Constants.Public),
            LogHandler.Log(JSON.stringify(crt), Constants.Success)

        ])
        return true;
    }
    catch (err) {
        let failureCompensate = [
            LogHandler.Log(JSON.stringify(crt), Constants.Error, err),
            cert.updateOne({ _id: obj.certid, 'issuedby.org_id': obj.user.org_id, 'publish.status': false, 'publish.processing': true }, { $set: { 'publish.processing': false } })
        ]
        if (!isBlockChainPublished) {
            failureCompensate.push(CountHandler.IncreaseCount(obj.user.org_id, 1))
        }
        await Promise.all(failureCompensate)
        return false
    }

}

module.exports = { PublishBatch, PublishSingle }