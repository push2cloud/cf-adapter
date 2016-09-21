const convertSize = require('../lib/convertSize');
const debug = require('debug')('push2cloud-cf-adapter:updateServiceInstance');
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

    if (!options.serviceInstanceGuid) {
      return callback(new Error('Please provide a serviceInstanceGuid! \n' + JSON.stringify(options, null, 2)));
    }
    api.graceRequest({
      method: 'PUT',
      uri: `/v2/service_instances/${options.serviceInstanceGuid}`,
      json: {
        name: options.newName || options.name,
        service_plan_guid: options.service_plan_guid,
        parameters: options.parameters,
        tags: options.tags
      }
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      function proceed(res) {
        if (res.entity.name !== options.newName && options.newName) {
          delete _.remove(api.actualDeploymentConfig.services, (a) => a.name === options.name);
        }

        var serviceInstanceIdx = _.findIndex(api.actualDeploymentConfig.services, { name: res.entity.name });
        if (serviceInstanceIdx < 0) serviceInstanceIdx = api.actualDeploymentConfig.services.length;

        api.actualDeploymentConfig.services[serviceInstanceIdx] = {
          name: res.entity.name,
          guid: result.metadata.guid,
          type: res.entity.type,
          plan: res.entity.plan,
          lastOperation: {
            type: result.entity.last_operation.type,
            state: result.entity.last_operation.state
          }
        };

        callback(null, res);
      }

      proceed(result);
    });
  };
};
