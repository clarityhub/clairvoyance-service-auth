const { createToken } = require('service-claire/helpers/tokens');

module.exports = function (sequelize, Sequelize) {
  const Client = sequelize.define('Client', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    uuid: {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
      validate: {
        notEmpty: true,
      },
    },

    knownCookies: Sequelize.ARRAY(Sequelize.STRING),

    // XXX change to BIGINT
    accountId: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    deletedAt: Sequelize.DATE,
  }, {
    indexes: [
      {
        unique: true,
        fields: ['knownCookies'],
      },
    ],
    timestamps: true,
    paranoid: true,
  });

  Client.cleanAttributes = [
    'accountId',
    'createdAt',
    'updatedAt',
  ];

  Client.prototype.createToken = function () {
    return createToken({
      clientId: this.id,
      accountId: this.accountId,
      privilege: 'none',
      uuid: this.uuid,
    });
  };

  return Client;
};
