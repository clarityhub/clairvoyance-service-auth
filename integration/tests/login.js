const chai = require('chai');

const { expect } = chai;
const jwt = require('jsonwebtoken');

const { connect } = require('service-claire/services/pubsub');
const { subscribe, unsubscribe } = require('service-claire/rpc/listen');

const InjectInterface = require('service-claire/test/helpers/inject');

const usersSeed = require('../../seeders/20170530233215000-users-seed');
const { app } = require('../../src/index');
const limits = require('../../src/rate-limits');

describe('Login 1.0', () => {
  beforeEach((done) => {
    InjectInterface(usersSeed.down).then(() => {
      return InjectInterface(usersSeed.up).then(() => done());
    }).catch(done);
  });

  afterEach(() => {
    limits.resetKey('::ffff:127.0.0.1');
  });

  describe('POST /auth/login', () => {
    let called = false;
    let billingChannel = null;
    const billingExchange = 'test.billing';

    let authChannel = null;
    const authExchange = 'test.auth';


    before((done) => {
      connect.then(async (connection) => {
        const ach = await connection.createChannel();
        ach.assertExchange(authExchange, 'fanout', { durable: false });
        const q1 = await ach.assertQueue('', { exclusive: true });
        await ach.bindQueue(q1.queue, authExchange, '');

        authChannel = ach;

        const bch = await connection.createChannel();
        bch.assertExchange(billingExchange, 'fanout', { durable: false });
        const q2 = await bch.assertQueue('', { exclusive: true });
        await bch.bindQueue(q2.queue, billingExchange, '');

        billingChannel = bch;
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

      authChannel.close();
      billingChannel.close();

      done();
    });
    it('authenticates the user, returning a JWT token', (done) => {
      // Give the subscriptions some time to connect
      setTimeout(() => {
        chai.request(app)
          .post('/auth/login')
          .set({ 'X-Api-Version': '1.0' })
          .send({
            email: 'test@test.com',
            password: 'testing123',
          })
          .end((err, resp) => {
            if (err) {
              console.log(err, resp);
              done(err);
            }
            expect(resp.status).to.be.equal(200);
            expect(resp.body).to.be.an('object');
            expect(resp.body).to.contain.keys([
              'token',
            ]);
            expect(resp.body.token).to.not.be.empty;

            const decoded = jwt.decode(resp.body.token);

            expect(decoded).to.contain.keys([
              'userId',
              'email',
              'accountId',
              'iat',
              'status',
              'exp',
              'refresh',
            ]);

            expect(decoded).to.not.contain.keys([
              'name',
            ]);
            done();
          });
      }, 100);
    });

    it('sends an RPC request to billing', () => {
      expect(called).to.be.true;
    });


    it('returns unauthorized when invalid credentials are returned', (done) => {
      chai.request(app)
        .post('/auth/login')
        .set({ 'X-Api-Version': '1.0' })
        .send({
          email: 'test@test.com',
          password: 'testing1234',
        })
        .end((err, resp) => {
          expect(resp.status).to.be.equal(401);
          expect(resp.body).to.be.an('object');
          expect(resp.body.reason).to.not.be.empty;
          expect(resp.body.code).to.be.equal('Unauthorized');
          done();
        });
    });

    it('returns forbidden if the credentials are valid, but blacklisted', (done) => {
      chai.request(app)
        .post('/auth/login')
        .set({ 'X-Api-Version': '1.0' })
        .send({
          email: 'blacklisted@test.com',
          password: 'testing123',
        })
        .end((err, resp) => {
          expect(resp.status).to.be.equal(403);
          expect(resp.body).to.be.an('object');
          expect(resp.body.reason).to.not.be.empty;
          expect(resp.body.code).to.be.equal('Forbidden');
          done();
        });
    });

    it('returns forbidden if the credentials are valid, but the user is deleted', (done) => {
      chai.request(app)
        .post('/auth/login')
        .set({ 'X-Api-Version': '1.0' })
        .send({
          email: 'deleted@test.com',
          password: 'testing123',
        })
        .end((err, resp) => {
          expect(resp.status).to.be.equal(403);
          expect(resp.body).to.be.an.an('object');
          expect(resp.body.reason).to.not.be.empty;
          expect(resp.body.code).to.be.equal('Forbidden');
          done();
        });
    });
  });
});
