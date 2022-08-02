const uuidv4 = require('uuid/v4');

module.exports = function (sequelize, Sequelize) {
  const AccessToken = sequelize.define('AccessToken', {
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

    accessToken: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    publicKey: {
      type: Sequelize.UUID,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
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
    indexes: [
      {
        unique: false,
        fields: ['integrationUuid'],
      },
      {
        unique: true,
        fields: ['accessToken'],
      },
    ],
    timestamps: true,
    paranoid: true,
  });

  AccessToken.generate = () => {
    return uuidv4();
  };

  AccessToken.cleanPublicAttributes = ['integrationUuid', 'scopes', 'createdAt', 'updatedAt'];

  return AccessToken;
};
