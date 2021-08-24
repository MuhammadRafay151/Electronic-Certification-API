const puppeteer = require('puppeteer')
const image = require('../js/Image')
const Templates = require('../Templates/Register')
var fs = require('fs').promises;
var ejs = require('ejs');
const mime = require('mime')
var path = require("path")
async function GetPdf_Base64(data) {

    var buffer = await GetPdf_Buffer(data)
    return buffer.toString('base64')
}
async function GetPdf_Buffer(data) {
    var template = Templates.find(data.template_id)
    ProcessData(data);
    var htmlContent = await fs.readFile(path.join(__dirname, '..', "Templates", "html", template.html), 'utf8');
    var background_img = await image.GetImgBase64(path.join(__dirname, '..', "Templates", "backgrounds", template.img))
    background_img = `data:${mime.getType(template.img)};base64,${background_img}`
    var htmlRenderized = ejs.render(htmlContent, { data: data, img: background_img });
    const browser = await puppeteer.launch({
        args:['--no-sandbox'],//adding this config for docker support
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
function ProcessData(data) {
    data.template = data.default_template
    if (data.title) {
        data.template = replaceAll(data.template, '&lt;&lt;Title&gt;&gt;', data.title);
    }
    if (data.name) {
        data.template = replaceAll(data.template, '&lt;&lt;Name&gt;&gt;', data.name);
    }
    if (data.instructor_name) {
        data.template = replaceAll(data.template, '&lt;&lt;Instructor&gt;&gt;', data.instructor_name);
    }
    if (data.expiry_date) {
        data.template = replaceAll(data.template, '&lt;&lt;Expiry&gt;&gt;', new Date(data.expiry_date).toLocaleDateString());
    }
    if (data.batch_name) {
        data.template = replaceAll(data.template, '&lt;&lt;Batch&gt;&gt;', data.batch_name);
    }

}
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}
module.exports = { GetPdf_Base64: GetPdf_Base64, GetPdf_Buffer: GetPdf_Buffer, ProcessData }