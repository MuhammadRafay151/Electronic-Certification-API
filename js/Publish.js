const BlockChainCert = require('./BlockChainCert')
process.on('message', async (obj) => {
    var x = await BlockChainCert.ProcessBatchCerts(obj.batch, obj.bcert, obj.publish)
    process.send(x);
    process.exit(0)
});