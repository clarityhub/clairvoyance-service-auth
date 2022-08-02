module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('users', [{
      email: 'test@test.com',
      password: '$2a$04$bW1bE6WCI1OB8Fz5Jo3oGexHRTzIejci4aRL6Jjfx6fOnK2ZhW85a',
      status: 'active',
      accountId: '1',
      userId: '1',
      uuid: '4ce79463-dd1c-4ffc-aaad-748a990f0153',
    }, {
      email: 'blacklisted@test.com',
      password: '$2a$04$bW1bE6WCI1OB8Fz5Jo3oGexHRTzIejci4aRL6Jjfx6fOnK2ZhW85a',
      status: 'disabled',
      accountId: '1',
      userId: '2',
      uuid: '53bc4d64-7f31-4a29-bbe6-3468f586afb0',
    }, {
      email: 'deleted@test.com',
      password: '$2a$04$bW1bE6WCI1OB8Fz5Jo3oGexHRTzIejci4aRL6Jjfx6fOnK2ZhW85a',
      status: 'active',
      deletedAt: new Date(),
      accountId: '1',
      userId: '3',
      uuid: '86b01551-5863-4830-8de4-1e1cc3fe76bc',
    }]);
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('users', null, {});
  },
};
