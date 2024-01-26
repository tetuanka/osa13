const jwt = require('jsonwebtoken')
const router = require('express').Router()

const { SECRET } = require('../util/config')
const User = require('../models/user')
const Session = require('../models/session')


const tokenExtractor = (req, res, next) => {
    const authorization = req.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      try {
        token = authorization.substring(7)
        req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
        console.log(req.decodedToken)
      } catch (error) {
        console.log(error)
        return res.status(401).json({ error: 'token invalid' })
      }
    } else {
      return res.status(401).json({ error: 'token missing' })
    }
    next()
}

router.delete('/', tokenExtractor, async (req, res, next) => {
        try {
          const tokenFromHeader = req.headers.authorization.substring(7);
      
          // Delete the session with the matching token from the database
          await Session.destroy({ where: { token: tokenFromHeader } });
          res.clearCookie('sessionToken');
      
          // Respond with a success message
          res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });

module.exports = router