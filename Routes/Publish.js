const { response } = require('express');
const express = require('express');
const router = express.Router()
const Auth = require('../Auth/Auth')
const Roles = require('../js/Roles')
const batch_cert = require('../models/batch_certificates')
const batch = require('../models/batch')
const cert = require('../models/certificate');
const invoke = require('../BlockChain/invoke');
const cert_pdf = require('../js/CertificatePdf')
const Image = require('../js/Image')
const BlockChainCert = require('../js/BlockChainCert')
const { fork } = require('child_process');
router.post("/single", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {
    try {
        var publish = {
            status: true,
            publisher_name: req.user.name,
            publisher_email: req.user.email,
            publish_date: Date.now()
        }
        var temp = await cert.findOne({ _id: req.body.id, 'issuedby.org_id': req.user.org_id, 'publish.status': false })
        var BlockChainCert = await getblockchain_cert(temp, publish)
        await invoke.IssueCertificate(BlockChainCert, req.user.uid)
        var crt = await cert.findOneAndUpdate({ _id: req.body.id, 'issuedby.org_id': req.user.org_id, 'publish.status': false }, { $set: { publish: publish } })
        if (crt) {
            res.status(200).send("Published successfully")
        } else {
            res.status(404).send()
        }
    } catch (err) {
        res.status(500).send()
    }
})
router.post("/batch", Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin, Roles.Admin, Roles.Issuer]), async (req, res) => {
    try {
        var publish = {
            status: true,
            publisher_name: req.user.name,
            publisher_email: req.user.email,
            publish_date: Date.now()
        }
        // var crt = await batch.findOneAndUpdate({ _id: req.body.id, 'createdby.org_id': req.user.org_id, 'publish.status': false }, { $set: { publish: publish } })
        var bt = await batch.findOne({ _id: req.body.id, 'createdby.org_id': req.user.org_id, 'publish.status': false })
        if (bt) {
            var bcert = await batch_cert.find({ batch_id: req.body.id }).lean()
            if (bcert && bcert.length > 1) {
                const Publish = fork('./js/Publish.js');
                Publish.send({ batch: bt._doc, bcert, publish });
                Publish.on('message', result => {
                    console.log("Processing completed at", Date.now())
                    var io = req.app.get('socketio');
                    io.sockets.emit("message", "Batch Publish Sucsessfully");
                });
                Publish.on('close', () => { console.log("kiling child") });
                res.send("Processing started we will notify u soon")
            } else {
                res.status(409).send("batch must have more than 1 certificate to publish")
            }
        } else {
            return res.status(404).send("batch not found")
        }

    } catch (err) {
        res.status(500).send(err)
    }
})
async function getblockchain_cert(crt, publish) {
    var pdf_base64 = await cert_pdf.GetPdf_Base64(crt)
    var BlockChainCert = {
        id: crt._id,
        name: crt.name,
        title: crt.title,
        expiry_date: crt.expiry_date,
        instructor_name: crt.instructor_name,
        template_id: crt.template_id,
        publish: publish,
        pdf: pdf_base64,
        docType: "ecert",
    }

    return BlockChainCert
}
module.exports = router