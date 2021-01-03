const BlockChainCert = require('./BlockChainCert')
const batch_cert = require('../models/batch_certificates')
const batch = require('../models/batch')
async function PublishBatch(obj) {
    var publish = {
        status: true,
        publisher_name: obj.user.name,
        publisher_email: obj.user.email,
        publish_date: Date.now()
    }
    // var crt = await batch.findOneAndUpdate({ _id: obj.body.id, 'createdby.org_id': obj.user.org_id, 'publish.status': false }, { $set: { publish: publish } })
    var bt = await batch.findOne({ _id: obj.batchid, 'createdby.org_id': obj.user.org_id, 'publish.status': false })
    var bcert = await batch_cert.find({ batch_id: obj.batchid }).lean()
    var x = await BlockChainCert.ProcessBatchCerts(bt._doc, bcert, obj.publish)
    SendNotfication()

}
function SendNotfication() {
    console.log("Processing completed at", Date.now())
    // var io = obj.app.get('socketio');
    // io.sockets.to(obj.user.org_id).emit("message", `${obj.user.name} has Publish ${bt.batch_name} batch`);
}
module.exports={PublishBatch:PublishBatch}