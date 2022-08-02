const chai = require('chai');

const { expect } = chai;

const InjectInterface = require('service-claire/test/helpers/inject');
const { connect } = require('service-claire/services/pubsub');

const clientsSeed = require('../../seeders/20170625002637876-create-clients');
const accessTokenSeed = require('../../seeders/20171107233715542-create-access-tokens');
const { app } = require('../../src/index');
const limits = require('../../src/rate-limits');

const API_KEY = 'TEST API KEY';

describe('Client 1.0', () => {
  let authChannel = null;
  const authExchange = 'test.auth';

  before((done) => {
    connect.then(async (connection) => {
      const ach = await connection.createChannel();
      ach.assertExchange(authExchange, 'fanout', { durable: false });
      const q1 = await ach.assertQueue('', { exclusive: true });
      await ach.bindQueue(q1.queue, authExchange, '');

      authChannel = ach;

      done();
    });
  });

  beforeEach((done) => {
    InjectInterface(clientsSeed.down).then(() => {
      return InjectInterface(accessTokenSeed.down).then(() => {
        return InjectInterface(clientsSeed.up).then(() => {
          return InjectInterface(accessTokenSeed.up).then(() => done());
        });
      });
    }).catch(done);
  });

  after((done) => {
    authChannel.close();
    done();
  });

  afterEach(() => {
    limits.resetKey('::ffff:127.0.0.1');
  });

  describe('POST /auth/client', () => {
    it('returns 403 forbidden if the API_KEY is invalid', (done) => {
      chai.request(app)
        .post('/auth/client')
        .set({ 'X-Api-Version': '1.0' })
        .send({
          cookie: 'new-cookie-nom',
          apiKey: '',
        })
        .end((err, resp) => {
          expect(resp.status).to.be.equal(403);
          expect(resp.body.reason).to.be.equal('Invalid API Key');
          done();
        });
    });

    it('creates a new client when a new cookie is encountered and returns a jwt', (done) => {
      chai.request(app)
        .post('/auth/client')
        .set({ 'X-Api-Version': '1.0' })
        .send({
          cookie: 'new-cookie-nom',
          apiKey: API_KEY,
        })
        .end((err, resp) => {
          expect(resp.status).to.be.equal(200);
          expect(resp.body.token).to.not.be.empty;
          expect(resp.body.existed).to.be.false;
          done();
        });
    });

    it('returns a jwt when the cookie is recognized', (done) => {
      chai.request(app)
        .post('/auth/client')
        .set({ 'X-Api-Version': '1.0' })
        .send({
          cookie: 'meow',
          apiKey: API_KEY,
        })
        .end((err, resp) => {
          expect(resp.status).to.be.equal(200);
          expect(resp.body.token).to.not.be.empty;
          expect(resp.body.existed).to.be.true;
          done();
        });
    });
  });
});
