const _ = require('lodash');

module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    if (!api.spaceGuid) {
      return callback(new Error('Please provide a space! \n' + JSON.stringify(options, null, 2)));
    }

    if (!options.serviceBindingGuid && options.app && options.service && api.actualDeploymentConfig) {
      var b = _.find(api.actualDeploymentConfig.serviceBindings, { app: options.app, service: options.service });
      if (b) {
        options.serviceBindingGuid = b.guid;
      }
    }

    if (!options.serviceBindingGuid) {
      return callback(new Error('Please provide an serviceBindingGuid! \n' + JSON.stringify(options, null, 2)));
    }

    api.graceRequest({
      method: 'DELETE',
      uri: `/v2/service_bindings/${options.serviceBindingGuid}`
    }, (err, response, result) => {
      if (err && response && response.error_code === 'CF-ServiceBindingNotFound') {
        api.getServiceBinding({ serviceBindingGuid: options.serviceBindingGuid }, (newError, result) => {
          if (newError) {
            return callback(newError);
          }

          if (!result) {
            return callback(err);
          }

          api.graceRequest({
            method: 'DELETE',
            uri: `/v2/service_bindings/${options.serviceBindingGuid}`
          }, (err, response, result) => {
            if (err) {
              return callback(err);
            }

            if (api.actualDeploymentConfig) {
              _.remove(api.actualDeploymentConfig.serviceBindings, { guid: options.serviceBindingGuid });
            }

            callback(null, result);
          });
        });
      }

      if (err) {
        return callback(err);
      }

      if (api.actualDeploymentConfig) {
        _.remove(api.actualDeploymentConfig.serviceBindings, { guid: options.serviceBindingGuid });
      }

      callback(null, result);
    });
  };
};
