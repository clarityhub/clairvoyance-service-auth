module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'Clients',
      'uuid',
      {
        type: Sequelize.UUID,
        notEmpty: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      }
    );
  },

  down(queryInterface) {
    return queryInterface.removeColumn(
      'Clients',
      'uuid'
    );
  },
};
