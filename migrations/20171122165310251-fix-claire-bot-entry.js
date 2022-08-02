const settings = require('../settings.json');

const { clarityHubUrl } = settings;

module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.query(`
      UPDATE "Credentials" 
      SET
        "redirectUri"='https://integrations${clarityHubUrl}/website-chat/oauth'
      WHERE
        "integrationUuid"='dc7cd7ec-335d-4375-8b78-96984ca90d9e'
      `);
  },
  down: (queryInterface) => {
    return queryInterface.sequelize.query(`
      UPDATE "Credentials" 
      SET
        "redirectUri"='https://integrations.clarityhub.app/website-chat/oauth'
      WHERE
        "integrationUuid"='dc7cd7ec-335d-4375-8b78-96984ca90d9e'
      `);
  },
};
