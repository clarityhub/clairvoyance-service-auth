const logger = require('service-claire/helpers/logger');

let channelPromise;

const authExchange = `${process.env.NODE_ENV || 'development'}.auth`;
const intExchange = `${process.env.NODE_ENV || 'development'}.integrations`;

const createPublishAuth = (connection) => {
  if (!channelPromise) {
    channelPromise = new Promise((resolve, reject) => {
      connection.then((c) => {
        return c.createChannel();
      }).then((ch) => {
        return ch.assertExchange(authExchange, 'fanout', { durable: false }).then(() => {
          resolve(ch);
        });
      }).catch((err) => {
        logger.error(err);
        reject(err);
      });
    });
  }

  return (data) => {
    channelPromise.then(channel => channel.publish(authExchange, '', Buffer.from(JSON.stringify(data))));
  };
};

const createPublishIntegrations = (connection) => {
  if (!channelPromise) {
    channelPromise = new Promise((resolve, reject) => {
      connection.then((c) => {
        return c.createChannel();
      }).then((ch) => {
        return ch.assertExchange(intExchange, 'fanout', { durable: false }).then(() => {
          resolve(ch);
        });
      }).catch((err) => {
        logger.error(err);
        reject(err);
      });
    });
  }

  return (data) => {
    channelPromise.then(channel => channel.publish(intExchange, '', Buffer.from(JSON.stringify(data))));
  };
};

module.exports = {
  createPublishAuth,
  createPublishIntegrations,
};
