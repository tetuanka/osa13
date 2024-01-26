const router = require('express').Router()

const { sequelize } = require('../util/db')
const { Op } = require('sequelize')

const { User, Blog } = require('../models')


router.get('/', async (req, res) => {
    try {
      const authorStats = await Blog.findAll({
        attributes: [
          'author', // Author's name
          [sequelize.fn('COUNT', sequelize.col('"blog"."id"')), 'articles'], // Count of blogs
          [sequelize.fn('SUM', sequelize.col('"blog"."likes"')), 'likes'] // Total likes
        ],
        include: [{ model: User, attributes: [] }], // Include User model without selecting any attributes
        group: ['"blog"."author"'], // Group by author
      });
  
      if (authorStats.length === 0) {
        res.json([]);
      } else {
        res.json(authorStats);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router