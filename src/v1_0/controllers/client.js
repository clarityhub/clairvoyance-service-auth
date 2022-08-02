const { ok, forbidden, notFound } = require('service-claire/helpers/responses');
const logger = require('service-claire/helpers/logger');
const { CLIENT_CREATED } = require('service-claire/events');
const {
  AccessToken,
  Client,
} = require('../../models');

/**
 * @apiDescription
 *
 * Login a client using a public key given to an integration
 *
 * @api {post} /auth/client Client Login
 * @apiVersion 1.0.0
 * @apiName ClientLogin
 * @apiGroup Auth Client
 *
 * @apiParam {String} publicKey Public key from an integration activation
 * @apiParam {String} cookie    Generated cookie
 *
 * @apiSuccess {String} token
 * @apiSuccess {String} clientId
 * @apiSuccess {Boolean} existed
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "516c0a3c-eca5-470d-9bf9-6bee41ecc9ff",
 *       "clientId": "1",
 *       "existed": true
 *     }
 */
const authClient = (req, res) => {
  const {
    // XXX change to publicKey
    apiKey: uuid,
    cookie,
  } = req.body;

  AccessToken.findOne({
    where: {
      publicKey: uuid,
    },
  }).then((apiKey) => {
    if (!apiKey) {
      notFound(res)();
      return;
    }

    const { accountId } = apiKey;

    return Client.findOrCreate({
      where: {
        knownCookies: {
          $contains: [cookie],
        },
        accountId,
      },
      defaults: {
        knownCookies: [cookie],
        accountId,
      },
    }).spread((client, created) => {
      req.services.publish({
        event: CLIENT_CREATED,
        ts: new Date(),
        meta: {
          raw: client,
          clean: {
            clientId: client.id,
            existed: !created,
          },
        },
      });

      ok(res)({
        token: client.createToken(),
        clientId: client.id,
        existed: !created,
      });
    });
  }).catch((err) => {
    logger.error(err);
    forbidden(res)({
      reason: 'Invalid API Key',
    });
  });
};

module.exports = {
  authClient,
};
