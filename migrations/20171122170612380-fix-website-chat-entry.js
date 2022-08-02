const settings = require('../settings.json');

const { clarityHubUrl } = settings;

module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.query(`
      UPDATE "Credentials" 
      SET
        "redirectUri"='https://integrations${clarityHubUrl}/suggestions/oauth'
      WHERE
        "integrationUuid"='65f3c689-5c8f-4ac3-8e82-ea56871e327b'
      `);
  },
  down: (queryInterface) => {
    return queryInterface.sequelize.query(`
      UPDATE "Credentials" 
      SET
        "redirectUri"='https://integrations.clarityhub.app/suggestions/oauth'
      WHERE
        "integrationUuid"='65f3c689-5c8f-4ac3-8e82-ea56871e327b'
      `);
  },
};
