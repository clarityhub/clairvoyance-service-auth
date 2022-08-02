module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'ResetRequests',
      'userId',
      {
        type: Sequelize.BIGINT,
      }
    );
  },

  down(queryInterface) {
    return queryInterface.removeColumn(
      'ResetRequests',
      'userId'
    );
  },
};
