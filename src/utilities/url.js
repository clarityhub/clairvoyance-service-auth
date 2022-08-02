const url = require('url');

const checkUri = (real, test) => {
  const r = new url.URL(real);
  const t = new url.URL(test);

  if (r.hostname !== t.hostname) {
    return false;
  }

  // Check that the real path is at the start of the test path
  if (t.pathname.indexOf(r.pathname) !== 0) {
    return false;
  }

  return test;
};

module.exports = {
  checkUri,
};
