module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    if (!options.name) {
      return callback(new Error('Please provide a name! \n' + JSON.stringify(options, null, 2)));
    }

    if (!api.spaceGuid) {
      return callback(new Error('Please provide a space! \n' + JSON.stringify(options, null, 2)));
    }

    api.graceRequest({
      method: 'GET',
      uri: '/v2/service_instances',
      qs: {
        'q': `name:${options.name};space_guid:${api.spaceGuid}`
      }
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (!result || result.total_results !== 1) {
        return callback(new Error(`No service found ${options.name}!`));
      }

      callback(null, result.resources[0]);
    });
  };
};
