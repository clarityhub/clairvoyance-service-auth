const urlPrefix = process.env.URL_PREFIX;
let url = '';

if (urlPrefix) {
  url = `https://integrations${urlPrefix}.clarityhub.io/website-chat`;
} else {
  url = 'https://integrations.clarityhub.app/website-chat';
}

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert(
      'Credentials',
      [{
        integrationUuid: 'dc7cd7ec-335d-4375-8b78-96984ca90d9e',
        clientId: '15fa3fbd-8f80-442b-99e4-33c96e51e6b9',
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
        "integrationUuid"='dc7cd7ec-335d-4375-8b78-96984ca90d9e'
      `);
  },
};
