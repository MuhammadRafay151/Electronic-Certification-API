const router = require('express').Router();

const cert = require("../models/certificate");
const bcert = require("../models/batch_certificates");
const config = require("config");
const { SendMail } = require('../js/nodemailer')
router.post('/certificates', async (req, res) => {
    if (config.get("app.BlockChain_Enable") === true) {
        return res.status(503).send();
    }
    res.send("we are searching your certificates you can check the response on your provided email in a while.")
    let promise = [
        cert.find({ email: req.body.email }, { _id: 1, title: 1 }),
        bcert.aggregate([
            { $match: { email: req.body.email } },
            {
                $lookup:
                {
                    from: "batches",
                    localField: "batch_id",
                    foreignField: "_id",
                    as: "batch"
                }
            },
            { $project: { "batch.title": 1 } }
        ])
    ]

    let response = await Promise.all(promise);
    let certificates = [
        ...response[0],
    ]
    response[1].forEach(x => {
        certificates.push({ _id: x._id, title: x.batch[0].title })
    })
    if (certificates.length > 0) {
        let link = config.get("app.verification_url")
        let body = "";
        certificates.forEach(x => {
            body += `${x.title} certificate : ${link}${x._id}\n`
        })
        console.log(body)
        await SendMail(
            {
                from: `<certifis.cf@gmail.com>`,
                to: req.body.email,
                subject: `Certifis Forget Certificate Reponse`,
                text: body
            }
        )
        // console.log("done")
    }
})
module.exports = router