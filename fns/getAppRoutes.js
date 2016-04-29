module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    if (!options.appGuid) {
      return callback(new Error('Please provide an appGuid! \n' + JSON.stringify(options, null, 2)));
    }

    api.graceRequest({
      method: 'GET',
      uri: `/v2/apps/${options.appGuid}/routes`,
      qs: options.hostname ? {
        'q': `host:${options.hostname}`
      } : {
        'q': `domain_guid:${options.domainGuid}`
      }
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (!result) {
        return callback(new Error('No routes!'));
      }

      callback(null, result.resources);
    });
  };
};
