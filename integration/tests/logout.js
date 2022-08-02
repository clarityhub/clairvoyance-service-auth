const chai = require('chai');

const { expect } = chai;
const { createToken } = require('service-claire/helpers/tokens');
const { createForgery } = require('service-claire/test/helpers/forgery');
const InjectInterface = require('service-claire/test/helpers/inject');

const usersSeed = require('../../seeders/20170530233215000-users-seed');
const { app } = require('../../src/index');
const limits = require('../../src/rate-limits');

describe('Logout 1.0', () => {
  beforeEach((done) => {
    InjectInterface(usersSeed.down).then(() => {
      InjectInterface(usersSeed.up).then(() => done());
    }).catch(done);
  });

  afterEach(() => {
    limits.resetKey('::ffff:127.0.0.1');
  });

  describe('POST /auth/logout', () => {
    it('successfully logs the user out when given a valid JWT', (done) => {
      // Create a token
      const token = createToken({
        userId: 1,
        email: 'test@test.com',
        status: 'active',
        accountId: '1',
      });

      chai.request(app)
        .post('/auth/logout')
        .set({
          'X-Api-Version': '1.0',
          token,
        })
        .end((err, resp) => {
          expect(resp.status).to.be.equal(200);
          done();
        });
    });

    it('returns forbidden if the credentials are invalid', (done) => {
      // Create a token
      const token = createToken({
        userId: 1,
        email: 'test@test.com',
        status: 'active',
        accountId: '1',
      });

      // Forge the token
      const forgery = createForgery(token);

      chai.request(app)
        .post('/auth/logout')
        .set({
          'X-Api-Version': '1.0',
          token: forgery,
        })
        .end((err, resp) => {
          expect(resp.status).to.be.equal(403);
          expect(resp.body).to.be.an('object');
          expect(resp.body.reason).to.not.be.empty;
          expect(resp.body.code).to.be.equal('Forbidden');

          done();
        });
    });
  });
});
