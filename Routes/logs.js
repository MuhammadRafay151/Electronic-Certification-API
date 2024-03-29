const router = require("express").Router();
const Auth = require("../Auth/Auth")
const logs = require('../models/logs');
const pagination = require('./../js/pagination');
const Roles = require('../js/Roles')
const axios = require('axios');
const config = require('config');
const utils = require('../js/utils');
router.get('/', Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {
    try {
        let perpage = 5
        let pageno = req.query.pageno
        if (isNaN(parseInt(pageno))) { pageno = 1 }
        let count = await logs.find().countDocuments();
        let response = await logs.find({}).sort({ date: -1 }).skip(pagination.Skip(pageno, perpage)).limit(perpage);
        res.json({ List: response, Count: count });
    } catch (err) {
        console.log(err)
        res.status(500).send();
    }
})
router.get('/docker', Auth.authenticateToken, Auth.CheckAuthorization([Roles.SuperAdmin]), async (req, res) => {
    if (!req.app.get("BlockChain_Enable"))
        return res.status(503).send("service is not avilable over non blockchain instance");
    try {
        let response = await axios({
            url: utils.fixBaseUrl(config.get('blockchain.dockerLogsURL')),
            method: "GET",
        })
        res.json(response.data);
    } catch (err) {
        console.log(err)
        res.status(500).send();
    }
})

module.exports = router