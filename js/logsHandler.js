const Logs = require("../models/logs");
async function Log(desc, status, message = "") {
    let l1 = new Logs({
        date: Date.now(),
        description: desc,
        status: status,
        message: message,
    });
    await l1.save();
}
module.exports = {
    Log
}