const { subscribe, unsubscribe } = require('service-claire/rpc/listen');
const logger = require('service-claire/helpers/logger');
const pubsubMiddleware = require('service-claire/middleware/publish');
const { createPublishIntegrations } = require('../v1_0/publications');

const pubsubIntegrationsMiddleware = pubsubMiddleware(createPublishIntegrations);
const req = {};

pubsubIntegrationsMiddleware(req, {}, () => { });

const {
  ResetRequest,
  user: User,
} = require('../models');
const Privileges = require('../enums/privilege');
const {
  createDefaultIntegrationsPromise,
  createCredentialsPromise,
  updateCredentialsPromise,
  deleteCredentialsPromise,
  getJwtFromAccessTokenPromise,
} = require('./controllers/credentials');

// TODO move the function to the controllers

/**
 * All users either have passwords already suggested,
 * which means they are full users. Or they do NOT
 * have a password, which means we need to add them
 * to the reset invite flow.
 */
subscribe('createAuthBulk', async (users) => {
  if (!(users instanceof Array)) {
    return { error: 'Users must be an array' };
  }

  const cleanUsersPromises = users.map((u) => {
    return new Promise((resolve, reject) => {
      if (u.password) {
        User.createPassword(u.password).then((p) => {
          resolve({
            uuid: u.uuid,
            userId: u.userId,
            email: u.email,
            password: p,
            accountId: u.accountId,
            status: 'active',
            privilege: u.privilege || Privileges.USER,
          });
        }).catch(e => reject(e));
      } else {
        resolve({
          uuid: u.uuid,
          userId: u.userId,
          email: u.email,
          accountId: u.accountId,
          status: 'active',
          privilege: Privileges.USER,
        });
      }
    });
  });
  try {
    const cleanUsers = await Promise.all(cleanUsersPromises);

    const createdUsers = await User.bulkCreate(cleanUsers, {
      returning: true,
    });

    const resetRequests = createdUsers.filter(u => !u.password).map(u => ({
      email: u.email,
      userId: u.id,
    }));

    const requests = await ResetRequest.bulkCreate(resetRequests, {
      returning: true,
    });

    const userObjects = await Promise.all(createdUsers.map(async (u) => {
      const resetPassword = requests.find(r => r.userId === u.id);
      return {
        id: u.userId,
        uuid: u.uuid,
        jwt: await u.createToken(),
        resetPasswordUuid: resetPassword ? resetPassword.uuid : null,
      };
    }));

    return userObjects;
  } catch (err) {
    logger.error(err);
    return Promise.resolve({ error: 'Users could not be created' });
  }
});

subscribe('deleteAuth', ({ accountId, userId }) => {
  return User.destroy({
    where: {
      accountId,
      userId,
    },
  });
});

subscribe('createDefaultIntegrations', (data) => {
  return createDefaultIntegrationsPromise(data, req.services.publish);
});

subscribe('createCredentials', createCredentialsPromise);
subscribe('updateCredentials', updateCredentialsPromise);
subscribe('deleteCredentials', deleteCredentialsPromise);
subscribe('getJwtFromAccessToken', getJwtFromAccessTokenPromise);

process.on('exit', () => {
  unsubscribe('createDefaultIntegrations');
  unsubscribe('createAuthBulk');
  unsubscribe('deleteAuth');
  unsubscribe('createCredentials');
  unsubscribe('deleteCredentials');
  unsubscribe('getJwtFromAccessToken');
});
