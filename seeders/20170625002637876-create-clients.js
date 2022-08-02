module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('Clients', [{
      knownCookies: ['meow'],
      accountId: '1',
      uuid: 'cd994600-6b8b-4e3b-b015-50a1e3497047',
    }, {
      knownCookies: ['meowmix'],
      accountId: '1',
      uuid: '16677296-92c4-421c-aee4-25d149168a2b',
    }]);
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('Clients', null, {});
  },
};
