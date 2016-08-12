const _ = require('lodash');

module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    if (!api.spaceGuid) {
      return callback(new Error('Please provide a space! \n' + JSON.stringify(options, null, 2)));
    }

    if (!options.serviceInstanceGuid && options.name && api.actualDeploymentConfig) {
      var s = _.find(api.actualDeploymentConfig.services, { name: options.name });
      if (s) {
        options.serviceInstanceGuid = s.guid;
      }
    }

    if (!options.serviceInstanceGuid && !options.name) {
      return callback(new Error('Please provide a serviceInstanceGuid or at least its name! \n' + JSON.stringify(options, null, 2)));
    }

    if (!options.serviceInstanceGuid) {
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
          return callback(new Error(`No service instance found for ${options.name}!`));
        }

        if (api.actualDeploymentConfig) {
          var servIdx = _.findIndex(api.actualDeploymentConfig.services, { guid: options.serviceInstanceGuid });
          if (servIdx >= 0) {
            api.actualDeploymentConfig.services[servIdx].lastOperation = {
              type: result.resources[0].entity.last_operation.type,
              state: result.resources[0].entity.last_operation.state
            };
          }
        }

        callback(null, result.resources[0]);
      });
      return;
    }

    api.graceRequest({
      method: 'GET',
      uri: `/v2/service_instances/${options.serviceInstanceGuid}`
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (!result) {
        return callback(new Error('No service instance info!'));
      }

      if (api.actualDeploymentConfig) {
        var servIdx = _.findIndex(api.actualDeploymentConfig.services, { guid: options.serviceInstanceGuid });
        if (servIdx >= 0) {
          api.actualDeploymentConfig.services[servIdx].lastOperation = {
            type: result.entity.last_operation.type,
            state: result.entity.last_operation.state
          };
        }
      }

      callback(null, result);
    });
  };
};
