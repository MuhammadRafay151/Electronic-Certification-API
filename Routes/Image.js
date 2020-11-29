const express = require('express');
const router = express.Router()
const image=require('../js/Image')

router.get('/:path', async (req, res) => {
    var path="./uploads/"+req.params.path;
    try {
        const data = await image.GetImageBuffer(path)
        res.contentType(req.query.mimetype);
        res.send(data)
    } catch(err) {
        res.status(404).send(err)
    }
})

module.exports = router