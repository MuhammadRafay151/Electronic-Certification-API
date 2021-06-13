const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const { swaggerDocument } = require('./Swagger/config');
const server = require('http').createServer(app);
var cors = require('cors')
const config = require('config');
const certificate = require('./Routes/Certificate');
const batch = require('./Routes/batch')
const bcerts = require('./Routes/batch_certs')
const organization = require('./Routes/Organization');
const account = require("./Routes/Account");
const users = require("./Routes/Users")
const mongoose = require('mongoose');
const count = require('./Routes/count')
const mail = require('./Routes/mail')
const download = require('./Routes/downloadpdf')
const image = require('./Routes/Image')
const publish = require('./Routes/Publish')
const verify = require('./Routes/verify')
const dashboard = require('./Routes/DashBoard')
const report = require("./Routes/Report")
const Notification = require("./Routes/Notification")
const Auth = require('./Auth/Auth');
const forget = require("./Routes/forget");
const LogHandler = require("./Routes/logs");
const socketEmit = require('./js/socketEmit')
const SocketSingleton = require("./js/Socket");
const { fork } = require('child_process');
const port = process.env.PORT || "8000";

require('dotenv').config();
app.use(express.json());
app.use(cors())
app.use("/api/account", account)
app.use("/api/users", users)
app.use("/api/certificate", certificate)
app.use("/api/batch", batch)
app.use("/api/bcert", bcerts)
app.use("/api/mail", mail)
app.use("/api/count", count)
app.use("/api/organization", organization)
app.use("/download", download)
app.use("/api/publish", publish)
app.use("/api/verify", verify)
app.use("/api/dashboard", dashboard)
app.use("/api/report", report)
app.use("/image", image)
app.use("/api/notification", Notification)
app.use("/api/forget", forget)
app.use("/api/logs",LogHandler);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
//app config loading
const app_config = config.get("app")
app.set("BlockChain_Enable", app_config.BlockChain_Enable)

//Socket Connection
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  Auth.AuthenticateSocket(token, socket, next)
  // console.log(token)
});
io.on('connection', socket => {
  SocketMap[socket.user.uid] = { ...socket.user, socket: { id: socket.id } }
  socket.join(socket.user.org_id);
  socket.emit('message', "welcome u are connected");
  socket.on('close', () => {
    socket.disconnect()
  })
  socket.on('join_debugging', () => {
    socket.join("debugging");
    socket.emit('message', "you are connected with debugging room");
    io.to("debugging").emit("log", { _id: "a1", message: "Listening to logs" })
  })
  socket.on('leave_debugging', () => {
    socket.leave("debugging");
    socket.emit('message', "you have left the debugging room");
  })
  socket.on('disconnect', () => {
    delete SocketMap[socket.user.uid]
  })
});
const SocketMap = {}
const s1 = new SocketSingleton(io, SocketMap);

// Rabitmq consumer
if (app.get("BlockChain_Enable")) {
  const sc = fork('./MessageBroker/SingleConsumer.js')
  const bc = fork('./MessageBroker/BatchConsumer.js')
  sc.on('message', async obj => {
    if (obj.debugging) {
      socketEmit.SendLogs(io, obj)
    }
    if (obj.IsSuccess) {
      if (obj.IsSuccess === true) {
        s1.emitToRoom(obj.user.org_id, "NotificationAlert", { count: 1 });
        s1.emitToUserId(obj.user.uid, "message", `certificate with id ${obj.certid}  has been published`);
        console.log("single published")
      } else
        s1.emitToUserId(obj.user.uid, "message", `certificate with id ${obj.certid}  failed to publish due to unkonwn error please try after some time`);

    }
  });
  bc.on('message', async obj => {
    if (obj.debugging) {
      socketEmit.SendLogs(io, obj)
    }
    if (obj.IsSuccess) {
      if (obj.IsSuccess === true) {
        s1.emitToRoom(obj.user.org_id, "NotificationAlert", { count: 1 });
        s1.emitToUserId(obj.user.uid, "message", `batch with id ${obj.batchid} has been published`);
      } else
        s1.emitToUserId(obj.user.uid, "message", `batch with id ${obj.batchid} failed to publish due to unkonwn error please try after some time`);
      console.log("batch published")
    }

  });
}



app.set('socketio', io);
app.set('SocketMap', SocketMap);

//db connection
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(config.get('database.url'), { useUnifiedTopology: true, useNewUrlParser: true }, (e) => { console.log(e, "Connected to db") })
server.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`)
  console.log("socket server connected")
});
//  require('crypto').randomBytes(64).toString('hex')
