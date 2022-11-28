const Sequelize = require('sequelize');

module.exports = class Code extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      title:{
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      content:{
        type: Sequelize.STRING(500),
        allowNull: false,
      },
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
      sendUsernick:{
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      created: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      state:{
        type: Sequelize.STRING(15),
        defaultValue: "unread",
      }
      
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Codesend',
      tableName: 'codesends', 
      paranoid: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }

  static associate(db) {
    db.Codesend.belongsTo(db.User);
  }
};