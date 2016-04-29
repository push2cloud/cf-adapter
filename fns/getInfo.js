const request = require('request');

module.exports = (api) => {
  return (callback) => {
    request({
      method: 'GET',
      baseUrl: api.options.api,
      uri: '/v2/info',
      rejectUnauthorized: api.options.rejectUnauthorized,
      json: true
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (!result) {
        return callback(new Error('No taget information!'));
      }

      callback(null, result);
    });
  };
};
