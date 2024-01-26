const router = require('express').Router()

const { User, Blog, Readinglist } = require('../models')
const { SECRET } = require('../util/config')


router.get('/', async (req, res) => {
  const users = await User.findAll({ 
    attributes: { exclude: ['blogId'] },
    include: {
      model: Blog,
      attributes: ['title'],
      required: false
    }
  })
  res.json(users)
})

// Change a username
router.put('/:username', async (req, res) => {
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
const { username } = req.params;
try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
    return res.status(404).json({ error: 'User not found' });
    }
    // Update the username
    await user.update({ username: req.body.username });
    return res.json(user);
} catch (error) {
    return res.status(400).json({ error: error.message });
}
});

router.post('/', async (req, res) => {
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
      const newUser = await User.create(req.body);
      res.json({ user: newUser });
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        // Validation error occurred
        const validationErrors = error.errors.map((err) => ({
          field: err.path,
          message: err.message
        }));
        return res.status(400).json({ errors: validationErrors });
      }
      // Other errors
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

router.delete('/:id', async (req, res) => {
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
const user = await User.findByPk(req.params.id)
if (user) {
    await user.destroy()
}
res.status(204).end()
})


// Get user information including reading list
router.get('/:id', async (req, res, next) => {
  try {
    const { read } = req.query;

    const includeConditions = {};
    if (read !== undefined) {
      includeConditions.read = read === 'true';
    }

    const user = await User.findByPk(req.params.id, {
      attributes: ['name', 'username'],
      include: [
        {
          model: Readinglist,
          attributes: ['id', 'read'],
          where: includeConditions,
          include: [
            {
              model: Blog,
              as: 'blog',
              attributes: ['id', 'url', 'title', 'author', 'likes', 'year_written'],
            },
          ],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: 'Not found' });
    }

    const userData = {
      name: user.name,
      username: user.username,
      readings: user.readinglists.map((item) => ({
        id: item.blog.id,
        url: item.blog.url,
        title: item.blog.title,
        author: item.blog.author,
        likes: item.blog.likes,
        year: item.blog.year_written,
        readinglists: [
          {
            read: item.read,
            id: item.id
          }
        ]
      })),
    };

    res.json(userData);
  } catch (error) {
    next(error);
  }
});

module.exports = router