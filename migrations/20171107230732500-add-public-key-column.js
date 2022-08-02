module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'AccessTokens',
      'publicKey',
      {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      }
    );
  },
  down: (queryInterface) => {
    return queryInterface.removeColumn(
      'AccessTokens',
      'publicKey'
    );
  },
};
