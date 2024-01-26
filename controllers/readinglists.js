const express = require('express');
const router = express.Router();
const { Readinglist, User } = require('../models');

const jwt = require('jsonwebtoken')

const { SECRET } = require('../util/config')

router.get('/', async (req, res) => {
    try {
        const lists = await Readinglist.findAll();
        res.json(lists);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


const tokenExtractor = (req, res, next) => {
    const authorization = req.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      try {
        console.log(authorization.substring(7))
        console.log(SECRET)
        req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
      } catch (error) {
        console.log(error)
        return res.status(401).json({ error: 'token invalid' })
      }
    } else {
      return res.status(401).json({ error: 'token missing' })
    }
    next()
}


//Change status
router.put('/:id', tokenExtractor, async (req, res, next) => {
  const tokenFromHeader = req.headers.authorization.substring(7); 
      console.log(tokenFromHeader)
      if(tokenFromHeader!=undefined){    
        const session = await Session.findOne({ where: { token: tokenFromHeader } });
        if (!session) {
          return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }}
      else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    const user = await User.findByPk(req.decodedToken.id)
    const { id } = req.params;
    const { read } = req.body;

    const readinglist = await Readinglist.findByPk(id);
    if (!readinglist) {
      return res.status(404).json({ error: 'Readinglist not found' });
    }

    if (readinglist.userId !== user.id) {
        return res.status(403).json({ error: 'Permission denied' });
    }

    try {
      const updatedStatus = await Readinglist.update({ read }, { where: { id } });
      res.json(updatedStatus);
    } catch (error) {
      next(error);
    }
})

// Add a blog to the reading list
router.post('/', async (req, res, next) => {
  const tokenFromHeader = req.headers.authorization.substring(7); 
      console.log(tokenFromHeader)
      if(tokenFromHeader!=undefined){    
        const session = await Session.findOne({ where: { token: tokenFromHeader } });
        if (!session) {
          return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }}
      else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  try {
    const { blogId, userId } = req.body;

    // Check if the blog is already in the reading list
    const isAlreadyAdded = await Readinglist.findOne({
      where: {
        userId,
        blogId,
      },
      as: 'readinglist',
    });

    if (isAlreadyAdded) {
      return res.status(400).json({ error: 'Blog already in reading list' });
    }

    // Add the blog to the reading list
    await Readinglist.create({
      userId,
      blogId,
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
