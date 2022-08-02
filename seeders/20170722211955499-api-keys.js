module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('ApiKeys', [{
      accountId: '1',
      creatorId: '1',
      uuid: 'a42273ff-ca22-48f5-98bd-d09623710e54',
      whitelist: ['*'],
    }, {
      accountId: '1',
      creatorId: '1',
      uuid: 'c69bd6a5-3271-4e78-8b82-aeb96c8c0260',
      whitelist: ['*.test.com'],
    }]);
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('ApiKeys', null, {});
  },
};
