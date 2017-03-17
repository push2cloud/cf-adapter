module.exports = (api) => {
  return (options, callback) => {
    if (!callback) {
      callback = options;
      options = {};
    }

    api.graceRequest({
      method: 'GET',
      uri: `/v2/spaces/${api.spaceGuid}/routes`,
      qs: options.hostname ? {
        'q': `host:${options.hostname}`,
        'results-per-page': 100
      } : (options.domainGuid ? {
        'q': `domain_guid:${options.domainGuid}`,
        'results-per-page': 100
      } : {})
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (!result) {
        return callback(new Error('No routes found!'));
      }

      callback(null, result.resources);
    });
  };
};
