const versionRouter = require('express-version-route');
const rpcMiddleware = require('service-claire/middleware/rpc');

const cors = require('cors');

const v1_0 = require('../v1_0/controllers/lifecycle');

module.exports = (router) => {
  router.use(cors());

  // Login routes
  const loginRoutes = new Map();

  loginRoutes.set('1.0', v1_0.login);
  loginRoutes.set('default', v1_0.login);

  router.route('/login')
    .options(cors())
    .post(
      cors(),
      rpcMiddleware,
      versionRouter.route(loginRoutes)
    );

  // Logout routes
  const logoutRoutes = new Map();

  logoutRoutes.set('1.0', v1_0.logout);
  logoutRoutes.set('default', v1_0.logout);

  router.route('/logout')
    .options(cors())
    .post(
      cors(),
      versionRouter.route(logoutRoutes)
    );

  // Logout routes
  const refreshRoutes = new Map();

  refreshRoutes.set('1.0', v1_0.refresh);
  refreshRoutes.set('default', v1_0.refresh);

  router.route('/refresh')
    .options(cors())
    .post(
      cors(),
      rpcMiddleware,
      versionRouter.route(refreshRoutes)
    );
};
