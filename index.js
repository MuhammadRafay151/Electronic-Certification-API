const express = require('express');
var cors = require('cors')
const helper = require('./helper');
const Invoke = require('./invoke');
const certificate = require('./Routes/Certificate');
const batch=require('./Routes/batch')
const bcerts=require('./Routes/batch_certs')
const organization=require('./Routes/Organization');
const query = require('./query');
const { authenticateToken, generateAccessToken } = require('./Auth/Auth');
const account=require("./Routes/Account");
const mongoose = require('mongoose');
const count=require('./Routes/count')
var multer  = require('multer')
var upload = multer()
/**
 * App Variables
 */

const app = express();
app.use(express.json());
app.use(cors())
const port = process.env.PORT || "8000";
const userorg = "Org1";
require('dotenv').config();
/**
 * Routes Definitions
 */
app.use("/api/account",account)
app.use("/api/certificate",certificate)
app.use("/api/batch",batch)
app.use("/api/bcert",bcerts)
app.use("/api/count",count)
app.use("/api/organization",organization)


mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://127.0.0.1:27017/ecert',{ useUnifiedTopology: true,useNewUrlParser: true },()=>{console.log("Connected to db")})
app.post('/test',upload.any(),function(req,res){
  var x=req.files[0].buffer.toString('base64')
  
  res.send(req.body.as)
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


  let response = await helper.getRegisteredUser(username, orgName, true);


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
  var c1 = new certificate();
  c1.name = req.body.name;
  c1.email = req.body.email;
  c1.description = req.body.description;
  c1.organizations = userorg;
  c1.title = req.body.title;
  c1.key = req.body.key;
  try {
    var response = await Invoke.IssueCertificate(c1, "as4", userorg);
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
  res.status(200).send("Welcome to HyperLedgerFabric <br/>Apne bs Ghabarana nhi hy baqe sab khir hy <br/>Halwa hy bey...");
});

app.get("/user/:id", (req, res) => {
  res.status(200).send(req.params.id);
});

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});



