const _ = require('lodash');
const debug = require('debug')('push2cloud-cf-adapter:bindService');

module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    options.parameters = options.parameters || {};

    if (!api.spaceGuid) {
      return callback(new Error('Please provide a space! \n' + JSON.stringify(options, null, 2)));
    }

    if (!options.appGuid && options.app && api.actualDeploymentConfig) {
      var a = _.find(api.actualDeploymentConfig.apps, { name: options.app });
      if (a) {
        options.appGuid = a.guid;
      }
    }

    if (!options.serviceInstanceGuid && options.service && api.actualDeploymentConfig) {
      var s = _.find(api.actualDeploymentConfig.services, { name: options.service });
      if (s) {
        options.serviceInstanceGuid = s.guid;
      }
    }

    if (!options.serviceInstanceGuid) {
      return callback(new Error('Please provide a serviceInstanceGuid! \n' + JSON.stringify(options, null, 2)));
    }

    if (!options.appGuid) {
      return callback(new Error('Please provide an appGuid! \n' + JSON.stringify(options, null, 2)));
    }

    api.graceRequest({
      method: 'POST',
      uri: '/v2/service_bindings',
      json: {
        service_instance_guid: options.serviceInstanceGuid,
        app_guid: options.appGuid,
        parameters: options.parameters
      }
    }, (err, response, result) => {
      if (result && result.code === 90003) {
        if (!_.find(api.actualDeploymentConfig.serviceBindings, { appGuid: options.appGuid,
                                                                  serviceInstanceGuid: options.serviceInstanceGuid })) {
          api.getServiceBindings(options, (err, results) => {
            if (err) {
              return callback(err);
            }

            if (!results || results.length === 0) {
              debug('Missing service binding infos!', results);
              return callback(new Error('Missing service binding infos!'));
            }

            var sb = _.find(results, (item) => {
              return item.entity.app_guid === options.appGuid
                  && item.entity.service_instance_guid === options.serviceInstanceGuid;
            });

            if (!sb) {
              debug('Missing service binding infos!', results);
              return callback(new Error('Missing service binding infos!'));
            }

            var service, app;
            if (api.actualDeploymentConfig) {
              service = _.find(api.actualDeploymentConfig.services, { guid: options.serviceInstanceGuid });
              app = _.find(api.actualDeploymentConfig.apps, { guid: options.appGuid });
            }

            api.actualDeploymentConfig.serviceBindings.push({
              guid: sb.metadata.guid,
              appGuid: options.appGuid,
              serviceInstanceGuid: options.serviceInstanceGuid,
              service: service.name,
              app: app.name
            });

            callback(null, sb);
          });
          return;
        } else {
          return callback(new Error(result.description));
        }
      }

      if (err && !(result && result.code === 90003)) {
        return callback(err);
      }

      if (!result || !result.metadata) {
        return callback(new Error('Not expected result! \n' + JSON.stringify(result, null, 2)));
      }

      var service, app;
      if (api.actualDeploymentConfig) {
        service = _.find(api.actualDeploymentConfig.services, { guid: options.serviceInstanceGuid });
        app = _.find(api.actualDeploymentConfig.apps, { guid: options.appGuid });
      }

      api.actualDeploymentConfig.serviceBindings.push({
        guid: result.metadata.guid,
        appGuid: options.appGuid,
        serviceInstanceGuid: options.serviceInstanceGuid,
        service: service.name,
        app: app.name
      });

      callback(null, result);
    });
  };
};
