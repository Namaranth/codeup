const Sequelize = require('sequelize');

module.exports = class Code extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      codetitle: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      codeType:{
        type: Sequelize.STRING(10),
        allowNull: false,
      },
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Code',
      tableName: 'codes',
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }

  static associate(db) {
    db.Code.belongsTo(db.User);
  }
};