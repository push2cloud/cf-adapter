const request = require('request');

module.exports = (api) => {
  return (callback) => {
    if (!api.targetInfo) {
      return callback(new Error('No taget information!'));
    }

    if (!api.options.username) {
      return callback(new Error('Please provide a username! \n' + JSON.stringify(api.options, null, 2)));
    }

    if (!api.options.password) {
      return callback(new Error('Please provide a password! \n' + JSON.stringify(api.options, null, 2)));
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
        grant_type: 'password',
        client_id: 'cf',
        username: api.options.username,
        password: api.options.password
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
