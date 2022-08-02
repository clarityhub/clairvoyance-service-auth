const versionRouter = require('express-version-route');
const pubsubMiddleware = require('service-claire/middleware/publish');

const cors = require('cors');

const makeMap = require('service-claire/helpers/makeMap');
const v1_0 = require('../v1_0/controllers/client');
const { createPublishAuth } = require('../v1_0/publications');

const pubsubAuthMiddleware = pubsubMiddleware(createPublishAuth);

module.exports = (router) => {
  router.route('/client')
    .options(cors())
    .post(
      cors(),
      pubsubAuthMiddleware,
      versionRouter.route(makeMap({
        '1.0': v1_0.authClient,
        default: v1_0.authClient,
      }))
    );
};
