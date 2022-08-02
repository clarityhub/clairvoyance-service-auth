const {
  INTEGRATION_ACTIVATED,
  INTEGRATION_REVOKED,
} = require('service-claire/events');
const {
  ok, error, notFound, badRequest,
} = require('service-claire/helpers/responses');
const logger = require('service-claire/helpers/logger');
const { checkUri } = require('../../utilities/url');
const { settings } = require('service-claire/helpers/config');

const {
  AccessToken,
  Credential,
  user: User,
  Code,
} = require('../../models');

const FIFTEEN_MINUTES = 1000 * 60 * 15;

/**
 * @private
 */
const getCredentialPublic = async (req, res) => {
  const { integrationUuid } = req.params;

  try {
    const credential = await Credential.findOne({
      where: {
        integrationUuid,
      },
      attributes: Credential.cleanPublicAttributes,
    });

    if (!credential) {
      notFound(res)();
      return;
    }

    ok(res)(credential.get({ plain: true }));
  } catch (err) {
    logger.error(err);
    error(res)(err);
  }
};

/**
 * @apiPrivate
 * @apiDescription
 * Get credentials for an integration. If this request is made by someone
 * outside of the account that made the integration, this endpoints only
 * returns public data.
 *
 * Used by developers to get the credentials for their
 * own integration.
 *
 * @api {get} /auth/credentials/:integrationUuid Get Credentials
 * @apiVersion 1.0.0
 * @apiName GetCredentials
 * @apiGroup Auth Credentials
 *
 * @apiParam (Login) {String} jwt
 *
 * @apiSuccess {String} [accessToken]   Will only be returned if the user belongs to the account
 * @apiSuccess {String} [clientSecret]  Will only be returned if the user belongs to the account
 * @apiSuccess {String} [redirectUri]   Will only be returned if the user belongs to the account
 * @apiSuccess {String} integrationUuid
 * @apiSuccess {String} clientId
 * @apiSuccess {Array} scopes
 * @apiSuccess {Date} createdAt
 * @apiSuccess {Date} updatedAt
 *
 * @apiSuccessExample {json} Success-Response (Owner):
 *     HTTP/1.1 200 OK
 *     {
 *       "accessToken": "fc1ebeda-13ab-454d-b728-a42c900eaac7",
 *       "redirectUri": "",
 *       "integrationUuid": "799c76f7-4198-41ac-a318-376ea2ba7c01",
 *       "clientId": "77cf1f1f-c4a9-43d5-92dc-1da0bbeb6689",
 *       "clientSecret": "689f5aad-1477-402d-961a-960d4b04b634",
 *       "scopes": ["all"],
 *       "createdAt": "",
 *       "updatedAt": ""
 *     }
 */
const getCredential = async (req, res) => {
  const { userId, accountId } = req.user;
  const { integrationUuid } = req.params;

  try {
    const credential = await Credential.findOne({
      where: {
        // userId,
        accountId,
        integrationUuid,
      },
      attributes: Credential.cleanOwnerAttributes,
    });

    if (!credential) {
      getCredentialPublic(req, res);
      return;
    }

    const accessToken = await AccessToken.findOne({
      where: {
        integrationUuid,
        userId,
        accountId,
      },
    });

    const obj = credential.get({ plain: true });
    obj.accessToken = accessToken ? accessToken.accessToken : '';
    ok(res)(obj);
  } catch (err) {
    logger.error(err);
    error(res)(err);
  }
};

/**
 * @apiPrivate
 * @apiDescription
 * A user requests the credentials for a given integration by its :clientId.
 * This will only return the integration's public data.
 *
 * @api {get} /auth/credentials/client/:clientId Get Credentials By ClientId
 * @apiVersion 1.0.0
 * @apiName GetCredentialsByClientId
 * @apiGroup Auth Credentials
 *
 * @apiParam (Login) {String} jwt
 *
 * @apiSuccess {String} integrationUuid
 * @apiSuccess {String} clientId
 * @apiSuccess {Array} scopes
 * @apiSuccess {Date} createdAt
 * @apiSuccess {Date} updatedAt
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "integrationUuid": "799c76f7-4198-41ac-a318-376ea2ba7c01",
 *       "clientId": "77cf1f1f-c4a9-43d5-92dc-1da0bbeb6689",
 *       "scopes": ["all"],
 *       "createdAt": "",
 *       "updatedAt": ""
 *     }
 */
const getCredentialByClient = async (req, res) => {
  const { accountId } = req.user;
  const { clientId } = req.params;

  try {
    const credential = await Credential.findOne({
      where: {
        clientId,
      },
      attributes: Credential.cleanPublicAttributes,
    });

    if (!credential) {
      notFound(res)();
      return;
    }

    // Does the user already have this integration active?
    const accessToken = await AccessToken.findOne({
      where: {
        integrationUuid: credential.integrationUuid,
        accountId,
      },
    });

    const obj = credential.get({ plain: true });
    obj.hasAccessToken = accessToken ? Boolean(accessToken.accessToken) : false;
    ok(res)(obj);
  } catch (err) {
    logger.error(err);
    error(res)(err);
  }
};

/**
 * Given an integration uuid, use it to find
 * the scopes requested from the access token
 */
const getAuthorizations = async (req, res) => {
  const { accountId } = req.user;
  const { integrationUuid } = req.params;

  try {
    const accessToken = await AccessToken.findOne({
      where: {
        integrationUuid,
        accountId,
      },
      attributes: AccessToken.cleanPublicAttributes,
    });

    if (!accessToken) {
      notFound(res)();
      return;
    }

    const obj = accessToken.get({ plain: true });
    ok(res)(obj);
  } catch (err) {
    logger.error(err);
    error(res)(err);
  }
};

const createCode = async (req, res) => {
  const {
    clientId,
    redirectUri,
    state,
  } = req.body;
  const {
    accountId,
    userId,
  } = req.user;

  try {
    const credential = await Credential.findOne({
      where: {
        clientId,
      },
    });

    if (!credential) {
      notFound(res)();
      return;
    }

    // Check that all the creds look good
    const validUri = redirectUri
      ? checkUri(credential.redirectUri, redirectUri)
      : credential.redirectUri;
    const paramState = state ? `&state=${state}` : '';

    // Create a code if everything is ok
    if (validUri) {
      const createdCode = await Code.create({
        accountId,
        userId,
        integrationUuid: credential.integrationUuid,
        credentialId: credential.id,
        scopes: credential.scopes,
        code: Code.generateCode(),
      }, {
        returning: true,
      });

      // create a redirection link
      // send back a redirection link
      const redirectionLink = `${validUri}?code=${createdCode.code}${paramState}`;
      ok(res)({
        redirectionLink,
      });
    } else {
      badRequest(res)({
        reason: 'Invalid redirect uri',
      });
    }
  } catch (err) {
    logger.error(err);
    error(res)(err);
  }
};

const activateCode = async (req, res) => {
  const {
    code,
  } = req.params;
  const {
    clientId,
    clientSecret,
  } = req.body;

  try {
    const credential = await Credential.findOne({
      where: {
        clientId,
        clientSecret,
      },
    });

    if (!credential) {
      notFound(res)();
      return;
    }

    const createdCode = await Code.findOne({
      where: {
        integrationUuid: credential.integrationUuid,
        code,
      },
    });

    if (!createdCode) {
      notFound(res)();
      return;
    }

    // Delete code after used
    Code.destroy({
      where: {
        integrationUuid: credential.integrationUuid,
        code,
      },
    });

    // Codes only live for 15 minutes
    const now = +new Date();
    if (now > FIFTEEN_MINUTES + createdCode.createdAt) {
      badRequest(res)({
        reason: 'This code has expired',
      });
      return;
    }

    const accessToken = await AccessToken.create({
      accountId: createdCode.accountId,
      userId: createdCode.userId,
      integrationUuid: createdCode.integrationUuid,
      credentialId: credential.id,
      accessToken: AccessToken.generate(),
      publicKey: AccessToken.generate(),
      scopes: createdCode.scopes,
    });

    req.services.publish({
      event: INTEGRATION_ACTIVATED,
      ts: new Date(),
      meta: {
        accountId: createdCode.accountId,
        integrationUuid: createdCode.integrationUuid,
      },
    });

    ok(res)({
      accessToken: accessToken.accessToken,
      publicKey: accessToken.publicKey,
      accountId: createdCode.accountId,
    });
  } catch (err) {
    logger.error(err);
    error(res)(err);
  }
};

const revokeIntegration = async (req, res) => {
  const { accountId } = req.user;
  const { integrationUuid } = req.params;
  try {
    // find the integration, get the accessToken
    const deletedToken = await AccessToken.findOne({
      where: {
        integrationUuid,
      },
    });
    // delete the AccessToken
    await AccessToken.destroy({
      where: {
        integrationUuid,
      },
    });

    if (!deletedToken) {
      notFound(res)();
      return;
    }

    req.services.publish({
      event: INTEGRATION_REVOKED,
      ts: new Date(),
      meta: {
        accountId,
        integrationUuid: deletedToken.integrationUuid,
        raw: {
          accessToken: deletedToken.accessToken,
        },
      },
    });

    ok(res)({});
  } catch (err) {
    logger.error(err);
    error(res)(err);
  }
};

const createCredentialsPromise = async ({ accountId, userId, integrationUuid }) => {
  // create api credentials
  const credential = await Credential.create({
    accountId,
    userId,
    integrationUuid,
    clientId: Credential.generateClientId(),
    clientSecret: Credential.generateClientSecret(),
    scopes: 'all',
  }, {
    returning: true,
  });

  // create accessTokens for own account
  await AccessToken.create({
    accountId,
    userId,
    integrationUuid,
    credentialId: credential.id,
    accessToken: AccessToken.generate(),
    publicKey: AccessToken.generate(),
    scopes: 'all',
  });

  return true;
};

const updateCredentialsPromise = async ({
  accountId, userId, integrationUuid, redirectUri,
}) => {
  await Credential.update({
    redirectUri,
  }, {
    where: {
      accountId,
      userId,
      integrationUuid,
    },
  });

  return true;
};

const deleteCredentialsPromise = async ({ integrationUuid }) => {
  await Credential.destroy({
    where: {
      integrationUuid,
    },
  });

  await Code.destroy({
    integrationUuid,
  });

  await AccessToken.destroy({
    integrationUuid,
  });

  return true;
};

/**
 *
 * @param {Object} param0
 * @param {String} scope pass empty string for wildcard
 */
const getJwtFromAccessTokenPromise = async ({ token, userUuid /* , scope */ }) => {
  try {
    const accessToken = await AccessToken.findOne({
      where: {
        accessToken: token,
      },
    });

    if (accessToken) {
      const whereClause = {
        accountId: accessToken.accountId,
      };

      if (userUuid) {
        whereClause.uuid = userUuid;
      } else {
        whereClause.userId = accessToken.userId;
      }
      // XXX use the scope to check the
      // integration can use the given userId
      const user = await User.findOne({
        where: whereClause,
      });

      if (user && user.isActive()) {
        return {
          token: await user.createToken(),
          integrationUuid: accessToken.integrationUuid,
        };
      }
    }
  } catch (err) {
    logger.error(err);
    return { err: 'Invalid Access token' };
  }

  return { err: 'Invalid Access token' };
};

const createDefaultIntegrationsPromise = ({ accountId, userId }, publish) => {
  try {
    settings.defaultIntegrations.forEach(async (uuid) => {
      const credential = await Credential.findOne({
        where: {
          integrationUuid: uuid,
        },
      });

      const accessToken = await AccessToken.create({
        accountId,
        userId,
        integrationUuid: uuid,
        credentialId: credential.id,
        accessToken: AccessToken.generate(),
        publicKey: AccessToken.generate(),
        scopes: credential.scopes,
      }, {
        returning: true,
      });

      publish({
        event: INTEGRATION_ACTIVATED,
        ts: new Date(),
        meta: {
          accountId,
          integrationUuid: uuid,
          raw: {
            accessToken: accessToken.accessToken,
            publicKey: accessToken.publicKey,
          },
          send: true,
        },
      });
    });

    return 'done';
  } catch (err) {
    logger.error(err);
  }
};

module.exports = {
  getCredential,
  getCredentialByClient,
  getAuthorizations,
  createCode,
  activateCode,
  revokeIntegration,
  createCredentialsPromise,
  updateCredentialsPromise,
  deleteCredentialsPromise,
  getJwtFromAccessTokenPromise,
  createDefaultIntegrationsPromise,
};
