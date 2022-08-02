const bcrypt = require('bcryptjs');
const logger = require('service-claire/helpers/logger');
const { createToken } = require('service-claire/helpers/tokens');

const Privileges = require('../enums/privilege');
const Statuses = require('../enums/status');

const DAY = 1000 * 60 * 60 * 24; // miliseconds * seconds * minutes * hours

module.exports = function (sequelize, Sequelize) {
  const User = sequelize.define('user', {
    id: {
      type: Sequelize.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },

    // This is the userUuid from service-users
    uuid: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      validate: {
        notEmpty: true,
      },
    },

    // This is the userId from service-users
    userId: {
      type: Sequelize.BIGINT,
      validate: {
        notEmpty: true,
      },
    },

    email: {
      type: Sequelize.STRING,
      validate: {
        isEmail: true,
      },
    },

    password: Sequelize.STRING,
    status: {
      type: Sequelize.ENUM,
      values: Statuses.toArray(),
      default: Statuses.ACTIVE,
    },

    privilege: {
      type: Sequelize.ENUM,
      values: Privileges.toArray(),
      default: Privileges.USER,
    },

    accountId: {
      type: Sequelize.BIGINT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    deletedAt: Sequelize.DATE,
  }, {
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
    ],
    timestamps: true,
    paranoid: true,
  });

  User.createPassword = function (password) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  };

  /**
   * Check that the plaintext password is equal to the
   * bcrypted password
   *
   * @returns Promise
   */
  User.prototype.checkPassword = function (password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, this.password, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  };

  /**
   * Check that the user is active
   *
   * @returns Boolean
   */
  User.prototype.isActive = function () {
    return this.status === Statuses.ACTIVE && !this.deletedAt;
  };

  /**
   * @returns token
   */
  User.prototype.createToken = async function (data = {}) {
    const { rpc } = data;
    let trialStatus = {
      status: 'trial',
      trialDaysLeft: 30,
      trialIsExpired: false,
    };

    if (rpc) {
      try {
        const billing = await rpc.call('getBillingAccount', { accountId: this.accountId });

        if (billing.plan && billing.plan !== 'trial') {
          trialStatus = {
            status: 'paid',
          };
        } else {
          const now = +new Date();
          const expiration = +new Date(billing.trialStart) + (billing.trialLength * DAY);

          const trialIsExpired = expiration < now;
          const trialDaysLeft = Math.round((expiration - now) / DAY);
          trialStatus = {
            status: 'trial',
            trialDaysLeft,
            trialIsExpired,
          };
        }
      } catch (err) {
        logger.error(err);
      }
    }

    return createToken({
      userId: this.userId,
      email: this.email,
      status: this.status,
      accountId: this.accountId,
      privilege: this.privilege,
      uuid: this.uuid,
      trialStatus,
    });
  };

  return User;
};
