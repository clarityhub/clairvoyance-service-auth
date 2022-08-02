const versionRouter = require('express-version-route');
const authMiddleware = require('service-claire/middleware/auth');
const pubsubMiddleware = require('service-claire/middleware/publish');
const cors = require('cors');
const makeMap = require('service-claire/helpers/makeMap');
const v1_0 = require('../v1_0/controllers/credentials');
const { createPublishIntegrations } = require('../v1_0/publications');

const pubsubIntegrationsMiddleware = pubsubMiddleware(createPublishIntegrations);

module.exports = (router) => {
  router.route('/credentials/client/:clientId')
    .options(cors())
    .get(
      cors(),
      authMiddleware,
      versionRouter.route(makeMap({
        '1.0': v1_0.getCredentialByClient,
        default: v1_0.getCredentialByClient,
      }))
    );

  router.route('/credentials/code')
    .options(cors())
    .post(
      cors(),
      authMiddleware,
      versionRouter.route(makeMap({
        '1.0': v1_0.createCode,
        default: v1_0.createCode,
      }))
    );

  router.route('/credentials/code/:code/activate')
    .options(cors())
    .post(
      cors(),
      pubsubIntegrationsMiddleware,
      versionRouter.route(makeMap({
        '1.0': v1_0.activateCode,
        default: v1_0.activateCode,
      }))
    );


  router.route('/credentials/:integrationUuid')
    .options(cors())
    .get(
      cors(),
      authMiddleware,
      versionRouter.route(makeMap({
        '1.0': v1_0.getCredential,
        default: v1_0.getCredential,
      }))
    )
    .delete(
      cors(),
      authMiddleware,
      pubsubIntegrationsMiddleware,
      versionRouter.route(makeMap({
        '1.0': v1_0.revokeIntegration,
        default: v1_0.revokeIntegration,
      }))
    );


  router.route('/authorizations/:integrationUuid')
    .options(cors())
    .get(
      cors(),
      authMiddleware,
      versionRouter.route(makeMap({
        '1.0': v1_0.getAuthorizations,
        default: v1_0.getAuthorizations,
      }))
    );
};
