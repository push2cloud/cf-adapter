const _ = require('lodash');
const debug = require('debug')('push2cloud-cf-adapter:createServiceInstance');

module.exports = (api) => {
  const createServiceInstance = (options, callback) => {
    var defaults = {
      tags: [],
      parameters: {}
    };

    _.defaults(options, defaults);

    if (!api.spaceGuid) {
      return callback(new Error('Please provide a space! \n' + JSON.stringify(options, null, 2)));
    }

    if (!options.name) {
      return callback(new Error('Please provide a name! \n' + JSON.stringify(options, null, 2)));
    }

    const servicePlan = api.getServicePlan(options.type, options.plan);

    if (!servicePlan) {
      return callback(new Error(`No servicePlan found with service ${options.type} and plan ${options.plan}!`));
    }

    api.graceRequest({
      method: 'POST',
      uri: '/v2/service_instances',
      json : {
        name: options.name,
        space_guid: api.spaceGuid,
        service_plan_guid: servicePlan.metadata.guid,
        parameters: options.parameters,
        tags: options.tags
      },
      qs: {
        accepts_incomplete: options.acceptsIncomplete === undefined || options.acceptsIncomplete === null ? true : options.acceptsIncomplete
      }
    }, (err, response, result) => {
      if (result && result.code === 60002) {
        if (!_.find(api.actualDeploymentConfig.services, { name: options.name })) {
          api.getServiceInstance(options, (err, result) => {
            if (err) {
              return callback(err);
            }

            if (!result || !result.metadata || !result.metadata.guid) {
              debug('Missing service instance infos!');
              return callback(new Error('Missing service instance infos!'));
            }

            api.actualDeploymentConfig.services.push({
              name: options.name,
              guid: result.metadata.guid,
              type: options.type,
              plan: options.plan
            });

            callback(null, result);
          });
          return;
        } else {
          return callback(new Error(result.description));
        }
      }

      if (err && !(result && result.code === 60002)) {
        return callback(err);
      }

      api.actualDeploymentConfig.services.push({
        name: options.name,
        guid: result.metadata.guid,
        type: options.type,
        plan: options.plan
      });

      callback(null, result);
    });
  };
  return createServiceInstance;
};
