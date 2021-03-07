const amqp = require("amqplib");
const pub = require('../js/Publish');
const mongoose = require('mongoose');
const config = require('config')
async function BatchConsumer() {
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    mongoose.connect(config.get('database.url'), { useUnifiedTopology: true, useNewUrlParser: true }, () => { console.log("Connected to db in batch consumer") })
    console.log("batch consumer started")
    try {
        const amqpServer = config.get("msgbroker.url")
        const connection = await amqp.connect(amqpServer)
        const channel = await connection.createChannel();
        channel.prefetch(1)//max number of unacknowledged deliveries for process  at a time
        await channel.assertQueue("batch");
        await channel.consume("batch", async msg => {
            let obj = JSON.parse(msg.content.toString())
            let IsSuccess = await pub.PublishBatch(obj)
            if (IsSuccess) {
                process.send({ ...obj, IsSuccess });
                channel.ack(msg)

            } else {
                process.send({ ...obj, IsSuccess });
                channel.ack(msg)
            }

        })
    }
    catch (ex) {
        console.error(ex)
    }

}
BatchConsumer()