const puppeteer = require('puppeteer')
var fs = require('fs').promises;
var ejs = require('ejs');
async function GetPdf_Base64(data) {
   
    var buffer = await GetPdf_Buffer(data)
    return buffer.toString('base64')
}
async function GetPdf_Buffer(data) {
    var htmlContent = await fs.readFile('Templates\\c1.ejs', 'utf8');
    var htmlRenderized = ejs.render(htmlContent, { data: data });
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
module.exports={GetPdf_Base64:GetPdf_Base64,GetPdf_Buffer:GetPdf_Buffer}