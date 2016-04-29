module.exports = (api) => {
  return (callback) => {
    if (!api.spaceGuid) {
      return callback(new Error('Please provide a spaceGuid!'));
    }

    api.graceRequest({
      method: 'GET',
      uri: `/v2/spaces/${api.spaceGuid}/summary`
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (!result) {
        return callback(new Error('No space summary!'));
      }

      callback(null, result);
    });
  };
};
