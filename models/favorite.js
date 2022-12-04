const Sequelize = require('sequelize');

module.exports = class Favorite extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
        favoriteId: {
            type: Sequelize.STRING,
            allowNull: false,
          },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Favorite',
      tableName: 'favorites',
      paranoid: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.Favorite.belongsTo(db.User);
  }
};