const express = require('express');
const router = express.Router()
const puppeteer = require('puppeteer')
var fs = require('fs').promises;
const cert = require('../models/certificate');
var ejs = require('ejs');
router.get('/test2', async (req, res) => {
    try {
        var htmlContent = await fs.readFile('Templates\\c1.ejs', 'utf8');
        var result = await cert.find().limit(1);
        var htmlRenderized = ejs.render(htmlContent, { data: result[0] });
        
        const browser = await puppeteer.launch({
            headless: true
        })
        const page = await browser.newPage()
        await page.setContent(htmlRenderized, {
            waitUntil: 'domcontentloaded'
        })
        var buffer = await page.pdf({
            format: 'A4',
            landscape: true,

        })
        await browser.close()
        res.contentType("application/pdf");
        res.send(buffer)

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

