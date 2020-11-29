const { model } = require('mongoose');

const fs = require('fs').promises;

async function GetImgBase64(path) {
    var x = await GetImageBuffer(path)
    return x.toString('base64')
}
async function GetImageBuffer(path) {
    const data = await fs.readFile(path);
    return data
}
module.exports={
    GetImgBase64:GetImgBase64,
    GetImageBuffer:GetImageBuffer
}