const amqp = require("amqplib");
const config = require('config');
async function send(IsSingle, msg) {

    let queue = IsSingle ? "single" : "batch"
    const amqpServer = config.get("msgbroker.url")
    const connection = await amqp.connect(amqpServer)
    const channel = await connection.createChannel();
    await channel.assertQueue(queue);
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)))
    console.log(`Job sent successfully`);
    await channel.close();
    await connection.close();

}
module.exports = {
    send: send
}