module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((transaction) => {
      return queryInterface.addColumn(
        'users',
        'privilege',
        {
          type: Sequelize.ENUM,
          values: ['admin', 'user', 'none'],
          default: 'user',
        },
        {
          transaction,
        }
      ).then(() => {
        return queryInterface.sequelize.query('UPDATE "users" SET privilege=\'admin\'', { transaction });
      });
    });
  },

  down(queryInterface) {
    return queryInterface.sequelize.query('ALTER TABLE "users" DROP COLUMN "privilege"; DROP TYPE "enum_users_privilege";');
  },
};
