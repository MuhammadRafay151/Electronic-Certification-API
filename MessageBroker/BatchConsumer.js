const amqp = require("amqplib");
const pub = require('../js/Publish');
const mongoose = require('mongoose');
const config = require('config')
async function BatchConsumer() {
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.connect('mongodb://127.0.0.1:27017/ecert', { useUnifiedTopology: true, useNewUrlParser: true }, () => { console.log("Connected to db in subscriber") })
    console.log("sub strated")
    try {
        var i = 0
        const amqpServer = config.get("msgbroker.url")
        const connection = await amqp.connect(amqpServer)
        const channel = await connection.createChannel();
        channel.prefetch(1)//max number of unacknowledged deliveries for process  at a time
        await channel.assertQueue("jobs");
        await channel.consume("jobs", async msg => {
            var obj = JSON.parse(msg.content.toString())
            console.log(obj)
            await pub.PublishBatch(obj)
            process.send(obj);
            channel.ack(msg)

        })
    }
    catch (ex) {
        console.error(ex)
    }

}
BatchConsumer()