const { badRequest, error, ok } = require('service-claire/helpers/responses');
const logger = require('service-claire/helpers/logger');

const {
  ResetRequest,
  user: User,
} = require('../../models');

const requestForgotPassword = (req, res) => {
  const {
    email,
  } = req.body;

  if (email === null || typeof email === 'undefined' ||
      email.trim() === '') {
    badRequest(res)({ reason: 'Invalid email' });
    return;
  }

  User.findOne({
    where: {
      email,
    },
  }).then((user) => {
    if (user) {
      return ResetRequest.create({
        email,
        userId: user.id,
      }, {
        returning: true,
      }).then((resetRequest) => {
        // Send invite email
        req.services.email.send({
          to: resetRequest.email,
          subject: 'Reset password',
          template: 'forgot',
          data: {
            email: resetRequest.email,
            uuid: resetRequest.uuid,
          },
        });

        return ok(res)({});
      });
    }

    // Don't leak any info, return ok anyway
    return ok(res)({});
  }).catch((err) => {
    logger.error(err);
    error(res)(err);
  });
};

const resetPassword = (req, res) => {
  const {
    uuid,
    password,
  } = req.body;

  ResetRequest.findOne({
    where: {
      uuid,
    },
  }).then((resetRequest) => {
    if (resetRequest) {
      return ResetRequest.destroy({
        where: {
          uuid,
        },
      }).then(() => {
        return User.createPassword(password).then((p) => {
          return User.update({
            password: p,
          }, {
            where: {
              id: resetRequest.userId,
            },
          }).then(() => {
            ok(res)({});
          });
        });
      });
    }
    // Couldn't find the user
    badRequest(res)({ reason: 'This reset request is invalid' });
    return null;
  }).catch((err) => {
    logger.error(err);
    error(res)(err);
  });
};

module.exports = {
  requestForgotPassword,
  resetPassword,
};
