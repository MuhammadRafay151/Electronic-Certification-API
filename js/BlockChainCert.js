const cert_pdf = require('../js/CertificatePdf')
const Image = require('../js/Image')
async function GetBlockChainCert(crt, publish) {
    var pdf_base64 = await cert_pdf.GetPdf_Base64(crt)
    var BlockChainCert = {
        _id: crt._id,
        name: crt.name,
        email:crt.email,
        title: crt.title,
        expiry_date: crt.expiry_date,
        instructor_name: crt.instructor_name,
        template_id: crt.template_id,
        publish: publish,
        logo: crt.logo,
        description: crt.description,
        signature: crt.signature,
        pdf: pdf_base64,
        docType: "ecert",
    }
    //should add organization data in the object also the parent organization refrence as well
    return BlockChainCert
}
async function ProcessBatchCerts(batch, batchcerts, publish) {
    certs = []
    for (let i = 0; i < batchcerts.length; i++) {
        let crt = Object.assign({}, batch)
        crt._id = batchcerts[i]._id
        crt.name = batchcerts[i].name
        crt.email = batchcerts[i].email
        crt = await GetBlockChainCert(crt, publish)
        certs.push(crt)
    }
    return certs
}
module.exports = {
    ProcessBatchCerts: ProcessBatchCerts,
    GetBlockChainCert: GetBlockChainCert
}