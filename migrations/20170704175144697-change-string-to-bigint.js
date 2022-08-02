module.exports = {
  up(queryInterface) {
    return queryInterface.changeColumn(
      'users',
      'accountId',
      {
        type: 'BIGINT USING CAST("accountId" as BIGINT)',
        // type: Sequelize.BIGINT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      }
    );
  },

  down(queryInterface) {
    return queryInterface.changeColumn(
      'users',
      'accountId',
      {
        type: 'VARCHAR(255) USING CAST("accountId" as VARCHAR)',
        // type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      }
    );
  },
};
