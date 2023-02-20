const jwt = require('jsonwebtoken')

const HttpError = require('../models/http-error')

module.exports = (req, res, next) => {
  // this is used due to browser issues with the OPTIONS req piece
  if (req.method === 'OPTIONS') {
    return next()
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error('Authentication failed!')
    }
    const decodedToken = jwt.verify(token, "totes_mcgoates_secret");
    req.userData = { userId: decodedToken.userId }
    next()
  } catch (err) {
    const error = new HttpError("Authentication failed!", 401);
    return next(error);
  }
  
}