const express = require('express');
const router = express.Router()
var fs = require('fs').promises;
const cert = require('../models/certificate');
const batch_cert = require('../models/batch_certificates')
const batch = require('../models/batch')
var ejs = require('ejs');
var cert_pdf = require('../js/CertificatePdf')
const files = require('../models/files')
// const Image = require('../js/Image')
router.get('/:id/:batch_id?', async (req, res) => {
    try {
        // var htmlContent = await fs.readFile('Templates\\c1.ejs', 'utf8');
        if (req.params.batch_id == null) {
            //single download
            var result = await cert.findOne({ _id: req.params.id, 'publish.status': true }).lean();
            if (result) {
                var logo = await files.findOne({ _id: result.logo })
                var signature = await files.findOne({ _id: result.signature })
                result.logo = { image: Buffer.from(logo.binary.buffer).toString('base64'), mimetype: logo.mimetype }
                result.signature = { image: Buffer.from(signature.binary.buffer).toString('base64'), mimetype: signature.mimetype }
                var buffer = await cert_pdf.GetPdf_Buffer(result)
                // var buff=Buffer.from(x, 'base64');
                res.contentType("application/pdf");
                return res.send(buffer)

            }
        }
        else {
            //batch certficate download
            var b1 = await batch.findOne({ _id: req.params.batch_id, 'publish.status': true }).lean()
            var bcert = await batch_cert.findOne({ _id: req.params.id, batch_id: req.params.batch_id })
            var path = "./uploads/"
            if (b1 && bcert) {
                var logo = await files.findOne({ _id: b1.logo })
                var signature = await files.findOne({ _id: b1.signature })
                b1.issue_date = bcert.issue_date
                b1._id = bcert._id
                b1.name = bcert.name
                b1.email = bcert.email
                b1.logo = { image: Buffer.from(logo.binary.buffer).toString('base64'), mimetype: logo.mimetype }
                b1.signature = { image: Buffer.from(signature.binary.buffer).toString('base64'), mimetype: signature.mimetype }
                var buffer = await cert_pdf.GetPdf_Buffer(b1)
                res.contentType("application/pdf");
                return res.send(buffer)

            }

        }
        res.status(404).send()
    } catch (err) { res.send(err) }

})
router.get('/test', async (req, res) => {
    try {
        var htmlContent = await fs.readFile('Templates\\c1.ejs', 'utf8');
        var result = await cert.find().limit(1);
        var htmlRenderized = ejs.render(htmlContent, { data: result[0] });
        res.send(htmlRenderized)



    } catch (err) { res.send(err) }

})
module.exports = router

