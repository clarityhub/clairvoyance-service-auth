module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'Codes',
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
      }
    );
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('Codes');
  },
};
