const Sequelize = require('sequelize');

module.exports = class Recommend extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
        
    }, {
      sequelize,
      timestamps: false,
      underscored: false,
      modelName: 'Recommend',
      tableName: 'recommends',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }
  static associate(db) {
    db.Recommend.belongsTo(db.User);
    db.Recommend.belongsTo(db.Post);
  }
}