const express = require('express');
const router = express.Router()
// const image = require('../js/Image')
const files = require('../models/files')
router.get('/:id', async (req, res) => {
    // var path = "./uploads/" + req.params.path;
    try {
        //reading image from file system 
        // const data = await image.GetImageBuffer(path)
        var r1 = await files.findOne({ _id: req.params.id })
        if (r1) {
            res.contentType(r1.mimetype);
            res.send(Buffer.from(r1.binary.buffer))
        } else {
            res.status(404).send()
        }
    } catch (err) {
        res.status(500).send(err)
    }
})

module.exports = router