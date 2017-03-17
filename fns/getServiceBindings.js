module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    api.graceRequest({
      method: 'GET',
      uri: '/v2/service_bindings',
      qs: options.serviceInstanceGuid ? {
        'q': `service_instance_guid:${options.serviceInstanceGuid}`,
        'results-per-page': 100
      } : {
        'q': `app_guid:${options.appGuid}`,
        'results-per-page': 100
      }
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (!result) {
        return callback(new Error('No service bindings!'));
      }

      callback(null, result.resources);
    });
  };
};
