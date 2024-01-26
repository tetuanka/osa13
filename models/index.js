const Blog = require('./blog')
const User = require('./user')
const Readinglist = require('./readinglist')
const Session = require('./session')

User.hasMany(Blog)
Blog.belongsTo(User)

User.hasMany(Readinglist);

User.hasMany(Readinglist, { foreignKey: 'user_id' });
Readinglist.belongsTo(User, { foreignKey: 'user_id' });

Blog.hasMany(Readinglist, { foreignKey: 'blog_id' });
Readinglist.belongsTo(Blog, { foreignKey: 'blog_id', as: 'blog' });

User.hasMany(Session);
Session.belongsTo(User);

module.exports = {
  Blog, User, Readinglist
}