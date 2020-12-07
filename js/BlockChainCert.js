const cert_pdf = require('../js/CertificatePdf')
const Image = require('../js/Image')
async function GetBlockChainCert(crt, publish) {
    var pdf_base64 = await cert_pdf.GetPdf_Base64(crt)
    var BlockChainCert = {
        id: crt._id,
        name: crt.name,
        title: crt.title,
        expiry_date: crt.expiry_date,
        instructor_name: crt.instructor_name,
        template_id: crt.template_id,
        publish: publish,
        logo: crt.logo,
        signature: crt.signature,
        pdf: pdf_base64,
        docType: "ecert",
    }
    return BlockChainCert
}
async function ProcessBatchCerts(batch, batchcerts, publish) {
    certs = []
    var path = "./uploads/"
    batch.logo.image = await Image.GetImgBase64(path + batch.logo.image)
    batch.signature.image = await Image.GetImgBase64(path + batch.signature.image)
    for (var i = 0; i < batchcerts.length; i++) {
        var crt = Object.assign({}, batch)
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