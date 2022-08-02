module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'users',
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
      'users',
      'uuid'
    );
  },
};
