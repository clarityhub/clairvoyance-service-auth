const {
  ok, unauthorized, forbidden, error,
} = require('service-claire/helpers/responses');
const { verifyToken } = require('service-claire/helpers/tokens');
const logger = require('service-claire/helpers/logger');
const jwt = require('jsonwebtoken');

const {
  user: User,
} = require('../../models');

const login = (req, res) => {
  const { email, password } = req.body;

  // TODO validate

  User.findOne({
    where: {
      email,
    },
    paranoid: false,
  }).then((user) => {
    if (user) {
      return user.checkPassword(password).then(async (valid) => {
        if (!valid) {
          return unauthorized(res)({
            reason: 'The email or password is not correct',
          });
        }

        if (user.isActive()) {
          // TODO send an event for analytics
          // req.services.log('login', {
          //   email, user_id: user.id, version: '1.0', method: 'password',
          // });
          return ok(res)({
            token: await user.createToken({ rpc: req.services.rpc }),
          });
        }
        return forbidden(res)({
          reason: 'This account is not active',
        });
      });
    }
    return unauthorized(res)({
      reason: 'The email or password is not correct',
    });
  }).catch((err) => {
    logger.error(err);
    error(res)(err);
  });
};

const logout = (req, res) => {
  verifyToken(req.headers.token).then((/* claim */) => {
    // TODO send analytic event
    // req.services.log('logout', {
    //   email: claim.email, user_id: claim.user_id, version: '1.0', method: 'logout',
    // });
    return ok(res)({});
  }).catch(() => {
    return forbidden(res)({
      reason: 'The token provided is not valid',
    });
  });
};

const refresh = (req, res) => {
  Promise.resolve(jwt.decode(req.headers.token)).then((claim) => {
    const refreshTimeExpired = Date.now() > claim.exp * 1000;

    if (refreshTimeExpired) {
      return forbidden(res)({
        reason: 'The token has expired',
      });
    }

    User.findOne({
      where: {
        email: claim.email,
      },
      paranoid: false,
    }).then(async (user) => {
      if (user && user.isActive()) {
        // TODO send an analytics event
        // req.services.log('refresh', {
        //   email: user.email, user_id: user.id, version: '1.0', method: 'refresh',
        // });
        return ok(res)({
          token: await user.createToken({ rpc: req.services.rpc }),
        });
      }
      return forbidden(res)({
        reason: 'This account is not active',
      });
    });
  }).catch((err) => {
    if (err.name === 'TokenExpiredError') {
      return forbidden(res)({
        reason: 'The token has expired',
      });
    }

    return forbidden(res)({
      reason: 'The token provided is not valid',
    });
  });
};

module.exports = {
  login,
  logout,
  refresh,
};
