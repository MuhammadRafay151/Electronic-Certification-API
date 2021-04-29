const organization = require('../models/organization');
const { StatusCodeException } = require('../Exception/StatusCodeException');
async function ReduceCount(orgid, cert_count) {
    let org = await organization.findOne({ _id: orgid });
    if (!org)
        throw new StatusCodeException(404, "organization not found")
    if (org.ecertcount < cert_count)
        throw new StatusCodeException(409, "Insufficient Count Balance")
    r1 = await organization.updateOne({ _id: orgid, $expr: { $gte: [{ $subtract: ["$ecertcount", cert_count] }, 0] } }, {
        $inc: { ecertcount: cert_count * -1 },
    });
    if (r1.nModified === 0) {
        throw new StatusCodeException(409, "count cannot be less than 0")
    }
}
async function IncreaseCount(orgid, cert_count) {
    let org = await organization.findOne({ _id: orgid });
    if (!org)
        throw new StatusCodeException(404, "organization not found")
    r1 = await organization.updateOne({ _id: orgid }, {
        $inc: { ecertcount: cert_count },
    });
    if (r1.nModified === 0) {
        throw new StatusCodeException(409, "some conflict while updating count")
    }
}
module.exports = {
    ReduceCount, IncreaseCount
}