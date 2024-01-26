const jwt = require('jsonwebtoken')
const router = require('express').Router()

const { SECRET } = require('../util/config')
const User = require('../models/user')
const Session = require('../models/session')

router.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({
    where: {
      username: body.username
    }
  })

  const passwordCorrect = body.password === 'secret'

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

 
  const userForToken = {
    username: user.username,
    id: user.id
  }

  const token = jwt.sign(userForToken, SECRET)

  const session = await Session.create({
    user_id: user.id,
    token,
    created_at: new Date(),
    updated_at: new Date(),
  });

  response
    .status(200)
    .cookie('sessionToken', token, { httpOnly: true })
    .send({ token, username: user.username, name: user.name })
})

module.exports = router