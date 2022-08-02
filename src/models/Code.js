const uuidv4 = require('uuid/v4');

module.exports = function (sequelize, Sequelize) {
  const Code = sequelize.define('Code', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    integrationUuid: {
      type: Sequelize.UUID,
      allowNull: false,
      valdiate: {
        notEmpty: true,
      },
    },

    credentialId: {
      type: Sequelize.BIGINT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    code: {
      type: Sequelize.UUID,
    },

    scopes: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    userId: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },

    accountId: {
      type: Sequelize.BIGINT,
      allowNull: false,
    },

    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    deletedAt: Sequelize.DATE,
  }, {
    timestamps: true,
    paranoid: true,
  });

  Code.cleanAttributes = [];

  Code.generateCode = () => {
    return uuidv4();
  };

  return Code;
};

