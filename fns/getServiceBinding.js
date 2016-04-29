module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    if (!options.serviceBindingGuid) {
      return callback(new Error('Please provide a serviceBindingGuid! \n' + JSON.stringify(options, null, 2)));
    }

    if (!api.spaceGuid) {
      return callback(new Error('Please provide a space! \n' + JSON.stringify(options, null, 2)));
    }

    api.graceRequest({
      method: 'GET',
      uri: `/v2/service_bindings/${options.serviceBindingGuid}`
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      callback(null, result);
    });
  };
};
