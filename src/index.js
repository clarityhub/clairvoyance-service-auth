const express = require('express');
const bodyParser = require('body-parser');

const limits = require('./rate-limits');
const routes = require('./routes');
require('./v1_0/subscriptions');
require('./v1_0/rpc');
const { settings } = require('service-claire/helpers/config');
const helmet = require('service-claire/middleware/helmet');
const errorHandler = require('service-claire/middleware/errors');
const logger = require('service-claire/helpers/logger');

logger.register('bd3dd747b53db0491f154f0df415b6d3');

const app = express();

app.enable('trust proxy');
app.use(helmet());
app.use(bodyParser.json());
app.use(limits);
app.use('/auth', routes);
app.use(errorHandler);

const server = app.listen(
  settings.port,
  () => logger.log(`✅ 👮🏽 service-auth running on port ${settings.port}`)
);

module.exports = { app, server }; // For testing
