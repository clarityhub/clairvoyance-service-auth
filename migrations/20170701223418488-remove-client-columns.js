module.exports = {
  up: (queryInterface) => {
    return queryInterface.removeColumn(
      'Clients',
      'name'
    ).then(() => {
      return queryInterface.removeColumn(
        'Clients',
        'email'
      );
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Clients',
      'name',
      Sequelize.STRING
    ).then(() => {
      return queryInterface.addColumn(
        'Clients',
        'email',
        Sequelize.STRING
      );
    });
  },
};
