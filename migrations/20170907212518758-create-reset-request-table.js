module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'ResetRequests',
      {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true,
        },

        email: {
          type: Sequelize.STRING,
          defaultValue: true,
        },

        uuid: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          validate: {
            notEmpty: true,
          },
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
        deletedAt: Sequelize.DATE,
      }
    );
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('ResetRequests');
  },
};
