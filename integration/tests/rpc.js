const chai = require('chai');

const { expect } = chai;

const call = require('service-claire/rpc/call');
const InjectInterface = require('service-claire/test/helpers/inject');
const limits = require('../../src/rate-limits');

const usersSeed = require('../../seeders/20170530233215000-users-seed');

describe('RPC createAuthBulk', () => {
  beforeEach((done) => {
    InjectInterface(usersSeed.down).then(() => {
      done();
    }).catch(done);
  });

  afterEach(() => {
    limits.resetKey('::ffff:127.0.0.1');
  });

  it('creates users', (done) => {
    const users = [
      {
        email: 'ivan@clarityhub.io',
        password: 'testing',
        accountId: '1',
        userId: '1',
      },
    ];

    call.then(c => c('createAuthBulk', users)).then((resp) => {
      expect(resp).to.be.length(1);
      done();
    });
  });

  it('creates users without passwords', (done) => {
    const users = [
      {
        email: 'ivan@clarityhub.io',
        password: 'testing',
        accountId: '1',
        userId: '1',
      },
      {
        email: 'aloukianova@clarityhub.io',
        accountId: '1',
        userId: '2',
      },
    ];

    call.then(c => c('createAuthBulk', users)).then((resp) => {
      expect(resp).to.be.length(2);
      done();
    });
  });

  // XXX test privileges

  // XXX add tests for deleteAuth
});
