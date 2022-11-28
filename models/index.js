const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const User = require('./user');
const Post = require('./post');
const Code = require('./code');
const Comment = require('./comment')
const Recommend = require('./recommend')
const Codesend = require('./codesend');

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config, {
  }); 

db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Code = Code;
db.Comment = Comment;
db.Recommend = Recommend;
db.Codesend = Codesend;

User.init(sequelize);
Post.init(sequelize);
Code.init(sequelize);
Comment.init(sequelize);
Recommend.init(sequelize);
Codesend.init(sequelize);


User.associate(db);
Post.associate(db);
Code.associate(db);
Comment.associate(db);
Recommend.associate(db);
Codesend.associate(db);

module.exports = db;