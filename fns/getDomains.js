module.exports = (api) => {
  return (callback) => {
    api.graceRequest({
      method: 'GET',
      uri: '/v2/domains'
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (!result) {
        return callback(new Error('No domains found!'));
      }

      callback(null, result.resources);
    });
  };
};
