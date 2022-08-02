module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'AccessTokens',
      {
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
      }
    );
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('AccessTokens');
  },
};
