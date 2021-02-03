const express = require('express');
const app = express();
const server = require('http').createServer(app);
var cors = require('cors')
const config = require('config');
const helper = require('./BlockChain/helper');
const Invoke = require('./BlockChain/invoke');
const certificate = require('./Routes/Certificate');
const batch = require('./Routes/batch')
const bcerts = require('./Routes/batch_certs')
const organization = require('./Routes/Organization');
// const query = require('./query');
const { authenticateToken, generateAccessToken } = require('./Auth/Auth');
const account = require("./Routes/Account");
const users = require("./Routes/Users")
const mongoose = require('mongoose');
const count = require('./Routes/count')
const download = require('./Routes/downloadpdf')
const image = require('./Routes/Image')
const publish = require('./Routes/Publish')
const verify= require('./Routes/verify')
const dashboard= require('./Routes/DashBoard')
const fs = require('fs').promises;
var multer = require('multer');
const Auth = require('./Auth/Auth');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})
var upload = multer({ storage: storage })
const { fork } = require('child_process');
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});
const port = process.env.PORT || "8000";
const userorg = "Org1";
require('dotenv').config();
app.use(express.json());
app.use(cors())
app.use("/api/account", account)
app.use("/api/users", users)
app.use("/api/certificate", certificate)
app.use("/api/batch", batch)
app.use("/api/bcert", bcerts)
app.use("/api/count", count)
app.use("/api/organization", organization)
app.use("/download", download)
app.use("/api/publish", publish)
app.use("/api/verify",verify)
app.use("/api/dashboard",dashboard)
app.use("/image", image)
//app config loading
const app_config = config.get("app")
app.set("BlockChain_Enable", app_config.BlockChain_Enable)

//Socket Connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  Auth.AuthenticateSocket(token, socket, next)
  // console.log(token)
});
io.on('connection', socket => {
  socket.join(socket.user.org_id);
  socket.emit('message', "welcome u are connected");
  socket.to(socket.user.org_id).emit('message', `${socket.user.name} is just logged in`);
  socket.on('close', () => {
    socket.disconnect()
  })
});
// Rabitmq consumer
if (app.get("BlockChain_Enable")) {
  const fk = fork('./MessageBroker/Subscriber.js')
  fk.send("")
  fk.on('message', obj => {
    io.sockets.to(obj.user.org_id).emit("message", `${obj.user.name} has Publish ${obj.batchid} batch`);
  });
}

//test file upload
var cpUpload = upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'signature', maxCount: 1 }])
app.post('/test', cpUpload, async (req, res) => {
  // var x = req.files

  // console.log(x)
  // console.log(req.files.logo[0])
  // const data = await fs.readFile(x.path);
  // res.contentType(x.mimetype);
  // res.send(data)
  var x = req.body.name
  console.log(typeof (1))
  res.json({ x: x })
})
// ---------------------------------------------dont  modify it----------------------------------------------------
app.get("/api/RegisterUser", async function (req, res) {

  try {
    var response = await helper.getRegisteredUser("as4", "as", "Org1", true);
    res.json(response);
  } catch (err) {
    res.json(err);
  }

})
app.get("/api/ca", async function (req, res) {
  await helper.isUserRegistered("a12", "Org1")
  res.send(200)
})
app.get('/users', async function (req, res) {
  var username = "a1";
  var orgName = "Org1";

  if (!username) {
    res.json(getErrorMessage('\'username\''));
    return;
  }
  if (!orgName) {
    res.json(getErrorMessage('\'orgName\''));
    return;
  }


  let response = await helper.getRegisteredUser(username);


  if (response && typeof response !== 'string') {


    res.json(response);
  } else {

    res.json({ success: false, message: response });
  }

});
app.get('/api/Login', async function (req, res) {
  // ...
  var isvalid = await helper.isUserRegistered(req.query.username, "Org1");
  if (isvalid == true) {
    const token = generateAccessToken({ username: req.query.username });
    res.json({ accesstoken: token });
  } else {
    res.status(401).send({ toker: "Invalid..." })
  }

  // ...
});
app.post('/api/IssueCertificate', async function (req, res) {
  // var c1 = new certificate();
  // c1.name = "Muhammad rafay";
  // c1.email = "muhammadrafay@gmail.com";
  // c1.description = "test certificate";
  // c1.organizations = userorg;
  // c1.title = "Nodejs";
  // c1.key = "cert25";

  var c1 = {
    name: req.body.name,
    email: req.body.email,
    description: req.body.description,
    organizations: userorg,
    title: req.body.title,
    id: req.body.id
  }
  try {
    var response = await Invoke.IssueCertificate(c1, "a1");
    c1.message = "Transaction Successful..."
    res.status(200).json(c1);
  } catch (err) {
    res.status(500)
  }


})
app.get('/api/VerifyCertificate/:id', async function (req, res) {

  var result = await query.GetCertificate("as4", req.params.id);
  if (result) {
    res.status(200).json(result);
  } else {

    res.status(200).json("Certificate Not Found...");
  }
})
app.get("/", (req, res) => {
  res.status(200).send("Welcome to Certifis <br/>Create digitally verified certificates<br/>Enjoy!");
});
app.get("/home/wel", (req, res) => {
  res.status(200).send("Welcome to Certifis <br/>Create digitally verified certificates<br/>Enjoy!");
});
app.get("/user/:id", (req, res) => {
  res.status(200).send(req.params.id);
});

app.set('socketio', io);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
//mongoose.connect('mongodb+srv://Admin1:15DhA4X99ApnacqZ@certifiscluster.btf5x.mongodb.net/ecert?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true }, () => { console.log("Connected to Mongo Atlas") })
mongoose.connect('mongodb://localhost:27017/ecert', { useUnifiedTopology: true, useNewUrlParser: true }, () => { console.log("Connected to db") })
server.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`)
  console.log("socket server connected")
});
//  require('crypto').randomBytes(64).toString('hex')
