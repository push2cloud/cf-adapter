const request = require('request');
const urlModule = require('url');

module.exports = (api) => {
  return (options, callback) => {
    if (!callback) {
      callback = options;
      options = {};
    }
    options = options || {};

    if (!api.targetInfo) {
      return callback(new Error('No taget information!'));
    }

    if (!api.token) {
      return callback(new Error('Please provide a token!'));
    }

    request({
      method: 'GET',
      baseUrl: api.targetInfo.authorization_endpoint,
      uri: '/oauth/authorize',
      rejectUnauthorized: api.options.rejectUnauthorized,
      // json: true,
      headers: {
        Authorization: `${api.token.token_type} ${api.token.access_token}`
      },
      qs: {
        response_type: 'code',
        grant_type: 'authorization_code',
        client_id: api.targetInfo.app_ssh_oauth_client
      },
      followRedirect: false
    }, (err, response, result) => {
      if (err) return callback(err);

      if (!response || !response.headers || !response.headers.location) return callback(new Error('No code received!'));

      const code = urlModule.parse(response.headers.location).query.substring('code='.length);

      callback(null, code);
    });
  };
};
