const _ = require('lodash');
const asyncOperationInProgressCheck = require('../lib/graceRequestHandler/asyncOperationInProgress');

module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    if (!options.serviceInstanceGuid && options.name && api.actualDeploymentConfig) {
      var s = _.find(api.actualDeploymentConfig.services, { name: options.name });
      if (s) {
        options.serviceInstanceGuid = s.guid;
      }
    }

    if (!options.serviceInstanceGuid) {
      return callback(new Error('Please provide a serviceInstanceGuid! \n' + JSON.stringify(options, null, 2)));
    }

    api.graceRequest({
      method: 'DELETE',
      uri: `/v2/user_provided_service_instances/${options.serviceInstanceGuid}`
    }, asyncOperationInProgressCheck, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (api.actualDeploymentConfig) {
        _.remove(api.actualDeploymentConfig.services, (service) => service.guid === options.serviceInstanceGuid);
      }

      callback(null, result);
    });
  };
};
