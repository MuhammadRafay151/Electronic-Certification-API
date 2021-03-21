const BlockChainCert = require('./BlockChainCert')
const batch_cert = require('../models/batch_certificates')
const batch = require('../models/batch')
const cert = require('../models/certificate')
const files = require('../models/files')
const { singleInvoke, batchInvoke } = require('../BlockChain/invoke')
const config = require('config')
async function PublishBatch(obj) {
    try {
        let publish = {
            status: true,
            publisher_name: obj.user.name,
            publisher_email: obj.user.email,
            publish_date: Date.now()
        }
        let bt = await batch.findOne({ _id: obj.batchid, 'createdby.org_id': obj.user.org_id, 'publish.status': false }).lean();
        if (config.get("app.debugging") === true) {
            process.send({ ...bt, message: "batch information", debugging: true });
        }
        let bcert = await batch_cert.find({ batch_id: obj.batchid }).lean()
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
            process.send({ _id: bt._id,  message: "Sending batch to the blockchain", debugging: true });
       
        }
        await batchInvoke(CryptoCert, obj.user.uid)
        await batch.updateOne({ _id: obj.batchid, 'createdby.org_id': obj.user.org_id, 'publish.status': false, 'publish.processing': true }, { $set: { publish: { ...publish, processing: false } } })
        if (config.get("app.debugging") === true) {
            process.send({ _id: bt._id,  message: "Batch has been published to the blockchain", debugging: true });
        }
        return true
        // let st = JSON.stringify(CryptoCert)
        // let te=JSON.parse(st)
        // console.log(te[0]._id)
        // let fs = require('fs');
        // fs.writeFile('batch.json', st, function (err) {
        //     if (err) return console.log(err);
        //     console.log('data writed to json file');
        // });
    }
    catch (err) {
        await batch.updateOne({ _id: obj.batchid, 'createdby.org_id': obj.user.org_id, 'publish.status': false, 'publish.processing': true }, { $set: { 'publish.processing': true } })
        console.log(err)
        return false
    }

}
async function PublishSingle(obj) {
    try {
        let publish = {
            status: true,
            publisher_name: obj.user.name,
            publisher_email: obj.user.email,
            publish_date: Date.now(),
        }
        let crt = await cert.findOne({ _id: obj.certid, 'issuedby.org_id': obj.user.org_id, 'publish.status': false }).lean()
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
        await singleInvoke(CryptoCert, obj.user.uid)
        await cert.updateOne({ _id: obj.certid, 'issuedby.org_id': obj.user.org_id, 'publish.status': false, 'publish.processing': true }, { $set: { publish: { ...publish, processing: false } } })
        if (config.get("app.debugging") === true) {
            let temp = { _id: crt._id, message: "Successfully published on blockchain", debugging: true };
            process.send(temp);
        }
        // let fs = require('fs');
        // fs.writeFile('single.pdf', Buffer.from(CryptoCert.pdf,'base64'), function (err) {
        //     if (err) return console.log(err);
        //     console.log('Hello World > helloworld.txt');
        // });
        return true;
    }
    catch (err) {
        await cert.updateOne({ _id: obj.certid, 'issuedby.org_id': obj.user.org_id, 'publish.status': false, 'publish.processing': true }, { $set: { 'publish.processing': false } })
        console.log(err)
        return false
    }

}
function SendNotfication() {
    console.log("Processing completed at", Date.now())
    // let io = obj.app.get('socketio');
    // io.sockets.to(obj.user.org_id).emit("message", `${obj.user.name} has Publish ${bt.batch_name} batch`);
}
module.exports = { PublishBatch, PublishSingle }