module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'users',
      'userId',
      {
        type: Sequelize.BIGINT,
        validate: {
          notEmpty: true,
        },
      }
    );
  },

  down(queryInterface) {
    return queryInterface.removeColumn(
      'users',
      'userId'
    );
  },
};
