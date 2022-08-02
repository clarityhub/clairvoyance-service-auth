module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'Credentials',
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
      }
    );
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('Credentials');
  },
};
