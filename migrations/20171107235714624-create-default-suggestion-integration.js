const urlPrefix = process.env.URL_PREFIX;
let url = '';

if (urlPrefix) {
  url = `https://integrations${urlPrefix}.clarityhub.io/suggestions`;
} else {
  url = 'https://integrations.clarityhub.app/suggestions';
}

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      'Credentials',
      [{
        integrationUuid: '65f3c689-5c8f-4ac3-8e82-ea56871e327b',
        clientId: 'c187f47a-552d-4b4b-a572-43d2e8223d50',
        clientSecret: '', // TODO INSERT CLIENT SECRET HERE
        redirectUri: `${url}/oauth`,
        scopes: 'all',
        userId: 1,
        accountId: 1,
      }]
    );
  },
  down: (queryInterface) => {
    return queryInterface.sequelize.query(`
      DELETE FROM "Credentials" WHERE
        "uuid"='65f3c689-5c8f-4ac3-8e82-ea56871e327b'
      `);
  },
};
