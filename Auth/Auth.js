const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  // Gather the jwt access token from the request header
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401) // if there isn't any token

  jwt.verify(token, process.env.TOKEN_SECRET.toString(), (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next() // pass the execution off to whatever request the client intended
  })
}
async function authenticateRefreshToken(token) {
  let result = await jwt.verify(token, process.env.REFRESH_TOKEN_SECRET.toString())
  return result
}
function AuthenticateSocket(token, socket, next) {
  jwt.verify(token, process.env.TOKEN_SECRET.toString(), (err, user) => {
    if (err) return next(new Error('Authentication error'))
    else {

      socket.user = user
      next()
    }// pass the execution off to whatever request the client intended
  })
}

function generateAccessToken(obj) {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign(obj, process.env.TOKEN_SECRET, { expiresIn: '1200s' });
}
function generateRefreshToken(obj) {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign(obj, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}
function CheckAuthorization(AllowedRoles) {
  return async (req, res, next) => {
    var UserRole = req.user.roles;
    var isvalid = false;
    for (var i = 0; i < UserRole.length; i++) {
      if (AllowedRoles.includes(UserRole[i])) {
        isvalid = true
        break;
      }
    }
    if (isvalid)
      next()
    else
      res.status('403').send()
  }

}
module.exports = {

  generateAccessToken: generateAccessToken,
  authenticateToken: authenticateToken,
  AuthenticateSocket: AuthenticateSocket,
  CheckAuthorization: CheckAuthorization,
  generateRefreshToken: generateRefreshToken,
  authenticateRefreshToken: authenticateRefreshToken

}