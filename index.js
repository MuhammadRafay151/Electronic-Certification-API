/**
 * Required External Modules
 */

const express = require('express');
const path = require("path");
const jwt = require("jsonwebtoken");
var cors = require('cors')
/**
 * App Variables
 */
const app = express();
app.use(express.json())
app.use(cors())
const port = process.env.PORT || "8000";
require('dotenv').config();
/**
 * Routes Definitions
 */

app.post("/api/RegisterUser", (req, res) => {

  res.send(200);

})

app.get('/api/Login', (req, res) => {
  // ...
  const token = generateAccessToken({ username: req.query.username });
  res.json({ accesstoken: token });
  // ...
});

app.get("/", (req, res) => {
  res.status(200).send("Welcome to HyperLedgerFabric <br/>Apne bs Ghabarana nhi hy baqe sab khir hy <br/>Halwa hy bey...");
});

app.get("/user", authenticateToken, (req, res) => {
  res.status(200).send(req.user);
});

function authenticateToken(req, res, next) {
  // Gather the jwt access token from the request header
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401) // if there isn't any token

  jwt.verify(token, process.env.TOKEN_SECRET.toString(), (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403)
    req.user = user
    next() // pass the execution off to whatever request the client intended
  })
}

function generateAccessToken(username) {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});
