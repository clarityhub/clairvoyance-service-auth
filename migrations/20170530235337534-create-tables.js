module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'users',
      {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true,
        },
        email: {
          type: Sequelize.STRING,
          validate: {
            isEmail: true,
          },
        },
        password: Sequelize.STRING,
        name: Sequelize.STRING,
        status: {
          type: Sequelize.ENUM,
          values: ['active', 'pending', 'disabled'],
        },
        orgId: {
          type: Sequelize.STRING,
          notEmpty: true,
          allowNull: false,
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
        deletedAt: Sequelize.DATE,
      }
    );
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('users');
  },
};
