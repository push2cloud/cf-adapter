module.exports = (api) => {
  return (callback) => {
    if (!api.orgGuid) {
      return callback(new Error('Please provide an orgGuid!'));
    }

    if (!api.spaceGuid && !api.options.space) {
      return callback(new Error('Please provide a space! \n' + JSON.stringify(api.options, null, 2)));
    }

    api.graceRequest({
      method: 'GET',
      uri: `/v2/organizations/${api.orgGuid}/spaces` + (api.spaceGuid ? `/${api.spaceGuid}` : ''),
      qs: api.spaceGuid ? undefined : {
        'q': `name:${api.options.space}`,
        'inline-relations-depth': 1
      }
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (!result || result.total_results !== 1) {
        return callback(new Error('No space information!'));
      }

      callback(null, result.resources[0]);
    });
  };
};
