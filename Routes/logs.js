const router = require("express").Router();
const Auth = require("../Auth/Auth")
const logs = require('../models/logs');
const pagination = require('./../js/pagination');
router.get('/', Auth.authenticateToken, async (req, res) => {
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

module.exports = router