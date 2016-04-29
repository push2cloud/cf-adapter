const request = require('request');

module.exports = (api) => {
  return (callback) => {
    if (!api.targetInfo) {
      return callback(new Error('No taget information!'));
    }

    if (!api.token) {
      return callback(new Error('Please provide a token!'));
    }

    request({
      method: 'POST',
      baseUrl: api.targetInfo.authorization_endpoint,
      uri: '/oauth/token',
      rejectUnauthorized: api.options.rejectUnauthorized,
      json: true,
      headers: {
        'Authorization': 'Basic Y2Y6',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: api.token.refresh_token
      }
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (!result) {
        return callback(new Error('No token information!'));
      }

      if (result.error) {
        return callback(new Error(result.error + ': ' + result.error_description));
      }

      callback(null, result);
    });
  };
};
