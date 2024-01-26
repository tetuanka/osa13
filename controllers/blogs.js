const router = require('express').Router()
const jwt = require('jsonwebtoken')

require('express-async-errors')

const { Op } = require('sequelize');

const { Blog, User } = require('../models')
const Session = require('../models/session')
const { SECRET } = require('../util/config')


router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    const whereCondition = search
      ? {
          [Op.or]: [
            { title: { [Op.iLike]: `%${search}%` } }, // Case-insensitive search in title
            { author: { [Op.iLike]: `%${search}%` } }, // Case-insensitive search in author
          ],
        }
      : {};
    const blogs = await Blog.findAll({ 
      where: whereCondition,
      attributes: { exclude: ['userId'] },
      order: [['likes', 'DESC']], // Sort by likes in descending order
      include: {
        model: User,
        attributes: ['username', 'name']
      }
    })
    res.json(blogs)

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
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


//Add blog
router.post('/', tokenExtractor, async (req, res, next) => {
  try {
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
    const blogData = { ...req.body, userId: user.id };

    // Validation
    if (blogData.year_written && (blogData.year_written < 1991 || blogData.year_written > new Date().getFullYear())) {
      return res.status(400).json({ error: 'Invalid year_written value' });
    }

    const blog = await Blog.create(blogData);
    res.json(blog);
  } catch (error) {
    next(error);
  }
})

//Delete blog
router.delete('/:id', tokenExtractor, async (req, res) => {
  try {
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

    const blog = await Blog.findByPk(req.params.id);
    const user = await User.findByPk(req.decodedToken.id)
    console.log(user)

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    console.log(blog.userId)
    console.log(user.id)
    if (blog.userId.toString() !== user.id.toString()) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await blog.destroy();
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Change number of likes
router.put('/:id', async (req, res, next) => {
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
  const { id } = req.params;
  const { likes } = req.body;
  try {
    const updatedBlog = await Blog.update({ likes }, { where: { id } });
    res.json(updatedBlog);
  } catch (error) {
    next(error);
  }
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

router.use(errorHandler)

module.exports = router