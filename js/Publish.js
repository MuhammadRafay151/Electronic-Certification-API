const BlockChainCert = require('./BlockChainCert')
const batch_cert = require('../models/batch_certificates')
const batch = require('../models/batch')
const cert = require('../models/certificate')
const files = require('../models/files')
const { json } = require('body-parser')
async function PublishBatch(obj) {
    var bt = await batch.findOne({ _id: obj.batchid, 'createdby.org_id': obj.user.org_id, 'publish.status': false })
    var bcert = await batch_cert.find({ batch_id: obj.batchid }).lean()
    var x = await BlockChainCert.ProcessBatchCerts(bt._doc, bcert, obj.publish)
}
async function PublishSingle(obj) {
    let publish = {
        status: true,
        publisher_name: obj.user.name,
        publisher_email: obj.user.email,
        publish_date: Date.now()
    }
    let crt = await cert.findOne({ _id: obj.certid, 'issuedby.org_id': obj.user.org_id, 'publish.status': false }).lean()
    let fl = await files.find({ _id: { $in: [crt.logo, crt.signature] } }).lean()
    let logo = fl.find(obj => obj.type === "logo")
    let signature = fl.find(obj => obj.type === "signature")
    crt.logo = { image: Buffer.from(logo.binary.buffer).toString('base64'), mimetype: logo.mimetype }
    crt.signature = { image: Buffer.from(signature.binary.buffer).toString('base64'), mimetype: signature.mimetype }
    let CryptoCert = await BlockChainCert.GetBlockChainCert(crt, publish)
    //await invoke.IssueCertificate(x, obj.user.uid)
    //let fs = require('fs');
    // fs.writeFile('helloworld.pdf', Buffer.from(CryptoCert.pdf,'base64'), function (err) {
    //     if (err) return console.log(err);
    //     console.log('Hello World > helloworld.txt');
    // });

}
function SendNotfication() {
    console.log("Processing completed at", Date.now())
    // let io = obj.app.get('socketio');
    // io.sockets.to(obj.user.org_id).emit("message", `${obj.user.name} has Publish ${bt.batch_name} batch`);
}
module.exports = { PublishBatch, PublishSingle }