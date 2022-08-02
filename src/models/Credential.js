const uuidv4 = require('uuid/v4');

module.exports = function (sequelize, Sequelize) {
  const Credential = sequelize.define('Credential', {
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

    clientId: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    clientSecret: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    redirectUri: {
      type: Sequelize.STRING,
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
        fields: ['clientId'],
      },
    ],
    timestamps: true,
    paranoid: true,
  });

  Credential.cleanOwnerAttributes = [
    'clientId',
    'clientSecret',
    'integrationUuid',
    'redirectUri',
    'scopes',
    'createdAt',
    'updatedAt',
  ];

  Credential.cleanPublicAttributes = [
    'integrationUuid',
    'clientId',
    'scopes',
    'createdAt',
    'updatedAt',
  ];

  Credential.generateClientId = () => {
    return uuidv4();
  };

  Credential.generateClientSecret = () => {
    return uuidv4();
  };

  return Credential;
};
