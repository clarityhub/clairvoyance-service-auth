const versionRouter = require('express-version-route');
const emailMiddleware = require('service-claire/middleware/email');
const makeMap = require('service-claire/helpers/makeMap');
const cors = require('cors');

const v1_0 = require('../v1_0/controllers/forgot');

module.exports = (router) => {
  router.use(cors());

  router.route('/forgot')
    .options(cors())
    .post(
      cors(),
      emailMiddleware,
      versionRouter.route(makeMap({
        '1.0': v1_0.requestForgotPassword,
        default: v1_0.requestForgotPassword,
      }))
    );

  router.route('/reset')
    .options(cors())
    .post(
      cors(),
      emailMiddleware,
      versionRouter.route(makeMap({
        '1.0': v1_0.resetPassword,
        default: v1_0.resetPassword,
      }))
    );
};
