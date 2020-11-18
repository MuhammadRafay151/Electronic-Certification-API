const express = require('express');
const router = express.Router()
const fs = require('fs').promises;

router.get('/:path', async (req, res) => {
    var path="./uploads/"+req.params.path;
    try {
        const data = await fs.readFile(path);
        res.contentType(req.query.mimetype);
        res.send(data)
    } catch(err) {
        res.status(404).send(err)
    }
})

module.exports = router