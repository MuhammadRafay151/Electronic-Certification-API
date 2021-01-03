const amqp = require("amqplib");
const config = require('config');
async function send(msg) {

    try {
        const amqpServer = config.get("msgbroker.url")
        const connection = await amqp.connect(amqpServer)
        const channel = await connection.createChannel();
        await channel.assertQueue("jobs");
        await channel.sendToQueue("jobs", Buffer.from(JSON.stringify(msg)))
        console.log(`Job sent successfully`);
        await channel.close();
        await connection.close();
    }
    catch (ex) {
        console.error(ex)
    }

}
module.exports = {
    send: send
}