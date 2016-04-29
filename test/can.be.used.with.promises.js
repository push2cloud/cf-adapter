const expect = require('expect.js');
const cfAdapter = require('../');

describe('can work with promises too', () => {

  var api;

  before(() => {
    api = cfAdapter({
      api: 'https://api.lyra-836.appcloud.swisscom.com',
      username: process.env.CF_USER,
      password: process.env.CF_PWD,
      org: process.env.CF_ORG,
      space: process.env.CF_SPACE
    });
  });

  describe('getInfo', () => {

    it('should work as expected', () => {

      return api.getInfo().then((result) => {
        expect(result).to.be.ok();
      });

    });

  });

  describe('init', () => {

    it('should work as expected', () => {

      return api.init().then((result) => {
        expect(api.inited).to.eql(true);
      });

    });

  });

});
