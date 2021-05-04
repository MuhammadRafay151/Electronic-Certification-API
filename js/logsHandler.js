const Logs = require("../models/logs");
async function Log(desc, status) {
    let l1 = new Logs({
        date: Date.now(),
        description: desc,
        status: status,
    });
    await l1.save();
}
module.exports = {
    Logs
}