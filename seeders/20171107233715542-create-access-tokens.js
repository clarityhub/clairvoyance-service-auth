module.exports = {
  up(queryInterface) {
    return queryInterface.bulkInsert('AccessTokens', [{
      accountId: '1',
      userId: '1',
      publicKey: 'a42273ff-ca22-48f5-98bd-d09623710e54',
      integrationUuid: 'da339fcb-edfc-47d2-ad1d-dafc3ef3b34e',
      credentialId: '123',
      accessToken: '531b2786-4b87-4878-b050-e8c2bb28de3f',
      scopes: 'something here',
    }, {
      accountId: '1',
      userId: '1',
      publicKey: '16677296-92c4-421c-aee4-25d149168a2b',
      integrationUuid: 'f6c2d5d9-bdaa-4aef-a4f5-e7fea7135931',
      credentialId: '123',
      accessToken: '531b2786-4b87-4878-b050-e8c2bb28de3f',
      scopes: 'something here',
    }]);
  },

  down(queryInterface) {
    return queryInterface.bulkDelete('AccessTokens', null, {});
  },
};
