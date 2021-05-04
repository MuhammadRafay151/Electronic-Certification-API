const router = require("express").Router();
const Auth = require("../Auth/Auth")
const logs = require('../models/logs');
router.get('/', Auth.authenticateToken, async (req, res) => {
    try {
        let response = await logs.find({});
        res.json(response);
    } catch (err) {
        console.log(err)
        res.status(500).send();
    }
})

module.exports = { router }