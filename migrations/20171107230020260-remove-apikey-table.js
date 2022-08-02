module.exports = {
  up: (queryInterface) => {
    return queryInterface.dropTable('ApiKeys');
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'ApiKeys',
      {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true,
        },

        accountId: {
          type: Sequelize.BIGINT,
          notEmpty: true,
          allowNull: false,
        },

        creatorId: {
          type: Sequelize.BIGINT,
          notEmpty: true,
          allowNull: false,
        },

        uuid: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          validate: {
            notEmpty: true,
          },
        },

        whitelist: Sequelize.ARRAY(Sequelize.STRING),

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
        deletedAt: Sequelize.DATE,
      }
    );
  },
};
