const chai = require('chai');
const sinon = require('sinon');

const { expect } = chai;
const { createToken } = require('service-claire/helpers/tokens');
const InjectInterface = require('service-claire/test/helpers/inject');

const { connect } = require('service-claire/services/pubsub');
const { subscribe, unsubscribe } = require('service-claire/rpc/listen');

const usersSeed = require('../../seeders/20170530233215000-users-seed');
const { app } = require('../../src/index');
const limits = require('../../src/rate-limits');

const TEN_DAYS = 1000 * 60 * 60 * 24 * 10;

describe('Refresh 1.0', () => {
  beforeEach((done) => {
    InjectInterface(usersSeed.down).then(() => {
      InjectInterface(usersSeed.up).then(() => done());
    }).catch(done);
  });

  afterEach(() => {
    limits.resetKey('::ffff:127.0.0.1');
  });

  let called = false;
  let billingChannel = null;
  const billingExchange = 'test.billing';


  before((done) => {
    connect.then(async (connection) => {
      const bch = await connection.createChannel();
      bch.assertExchange(billingExchange, 'fanout', { durable: false });
      const q2 = await bch.assertQueue('', { exclusive: true });
      await bch.bindQueue(q2.queue, billingExchange, '');

      billingChannel = bch;

      subscribe('getBillingAccount', ({ id }) => {
        called = true;
        return {
          plan: 'standard',
          accountId: id,
        };
      });

      // Give the subscriptions some time to connect
      setTimeout(() => {
        done();
      }, 100);
    });
  });

  after((done) => {
    unsubscribe('getBillingAccount');

    billingChannel.close();

    done();
  });

  describe('POST /auth/refresh', () => {
    it('successfully provides a new JWT when within the refresh date and past the exp', (done) => {
      // Create a token
      const token = createToken({
        userId: 1,
        email: 'test@test.com',
        status: 'active',
        accountId: '1',
      });

      chai.request(app)
        .post('/auth/refresh')
        .set({
          'X-Api-Version': '1.0',
          token,
        })
        .end((err, resp) => {
          expect(resp.status).to.be.equal(200);
          expect(resp.body).to.be.an('object');
          expect(resp.body).to.contain.keys([
            'token',
          ]);
          expect(resp.body.token).to.not.be.empty;
          done();
        });
    });

    it('sends an RPC request to billing', () => {
      expect(called).to.be.true;
    });

    it('returns forbidden if the JWT\'s exp time has expired', (done) => {
      // Create a token
      const token = createToken({
        userId: 1,
        email: 'test@test.com',
        status: 'active',
        accountId: '1',
      });

      const now = new Date();
      const clock = sinon.useFakeTimers(now.getTime() + TEN_DAYS);

      chai.request(app)
        .post('/auth/refresh')
        .set({
          'X-Api-Version': '1.0',
          token,
        })
        .end((err, resp) => {
          expect(resp.status).to.be.equal(403);
          expect(resp.body).to.be.an('object');
          expect(resp.body.reason).to.not.be.empty;

          clock.restore();
          done();
        });
    });
  });
});
