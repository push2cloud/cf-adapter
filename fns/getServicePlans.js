module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    if (!options.serviceId) {
      return callback(new Error('Please provide a serviceId! \n' + JSON.stringify(options, null, 2)));
    }

    api.graceRequest({
      method: 'GET',
      uri: '/v2/service_plans',
      qs: {
        'q': `service_guid:${options.serviceId}`
      }
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (!result || result.total_results === 0) {
        return callback(new Error(`No service plan for ${options.serviceId}!`));
      }

      callback(null, result.resources);
    });
  };
};
