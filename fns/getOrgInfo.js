module.exports = (api) => {
  return (callback) => {
    if (!api.orgGuid && !api.options.org) {
      return callback(new Error('Please provide an org! \n' + JSON.stringify(api.options, null, 2)));
    }

    api.graceRequest({
      method: 'GET',
      uri: '/v2/organizations' + (api.orgGuid ? `/${api.orgGuid}` : ''),
      qs: api.orgGuid ? undefined : {
        'q': `name:${api.options.org}`,
        'inline-relations-depth': 1
      }
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (!result || result.total_results !== 1) {
        return callback(new Error('No org information!'));
      }

      callback(null, result.resources[0]);
    });
  };
};
