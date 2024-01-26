require('dotenv').config()
const { Sequelize, Model, DataTypes } = require('sequelize')
const express = require('express')
const app = express()

const sequelize = new Sequelize(process.env.DATABASE_URL);



class Blog extends Model {}
Blog.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    author: {
      type: DataTypes.STRING,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
}, {
    sequelize,
    underscored: true,
    timestamps: false,   
})

app.get('/api/blogs', async (req, res) => {
  const blogs = await await Blog.findAll()
  res.json(blogs)
})

app.post('/api/blogs', async (req, res) => {
    try {
      const blog = await Blog.create(req.body)
      return res.json(blog)
    } catch(error) {
      return res.status(400).json({ error })
    }
})

app.delete('/api/blogs/:id', async (req, res) => {
    const blogId = req.params.id;
    try {
      const blog = await Blog.findByPk(blogId);
      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }
      await blog.destroy();
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting blog:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})