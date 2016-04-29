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
      uri: `/v2/spaces/${api.spaceGuid}/apps`,
      qs: {
        'q': `name:${options.name}`
      }
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (!result || result.total_results !== 1) {
        return callback(new Error(`No app found ${options.name}!`));
      }

      callback(null, result.resources[0]);
    });
  };
};
