module.exports = {
  up: (queryInterface) => {
    return queryInterface.renameColumn(
      'users',
      'orgId',
      'accountId'
    ).then(() => {
      return queryInterface.renameColumn(
        'Clients',
        'orgId',
        'accountId'
      );
    });
  },
  down: (queryInterface) => {
    return queryInterface.renameColumn(
      'users',
      'accountId',
      'orgId'
    ).then(() => {
      return queryInterface.renameColumn(
        'Clients',
        'accountId',
        'orgId'
      );
    });
  },
};
