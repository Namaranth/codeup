const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      title: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      content: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      Recommend: {
        type: Sequelize.INTEGER(10),
        allowNull: false,
        defaultValue: 0,
      },
      commentCount: {
        type: Sequelize.INTEGER(10),
        allowNull: false,
        defaultValue: 0,
      },
      created: {
        type: Sequelize.STRING(100),
        allowNull: false,
      }
    }, {
      sequelize,
      timestamps: true,
      createdAt: true,
      updatedAt: false,
      underscored: false,
      modelName: 'Post',
      tableName: 'posts',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }

  static associate(db) {
    db.Post.belongsTo(db.User);
    db.Post.hasMany(db.Comment);
    db.Post.hasMany(db.Recommend);
  }
};