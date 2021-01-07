const puppeteer = require('puppeteer')
const image = require('../js/Image')
const Templates = require('../Templates/Register')
var fs = require('fs').promises;
var ejs = require('ejs');
const mime = require('mime')

async function GetPdf_Base64(data) {

    var buffer = await GetPdf_Buffer(data)
    return buffer.toString('base64')
}
async function GetPdf_Buffer(data) {
    var template = Templates.find(data.template_id)
    var htmlContent = await fs.readFile('Templates\\html\\' + template.html, 'utf8');
    var background_img = await image.GetImgBase64('Templates\\backgrounds\\' + template.img)
    background_img = `data:${mime.getType(template.img)};base64,${background_img}`
    var htmlRenderized = ejs.render(htmlContent, { data: data, img: background_img });
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
    return buffer
}
module.exports = { GetPdf_Base64: GetPdf_Base64, GetPdf_Buffer: GetPdf_Buffer }