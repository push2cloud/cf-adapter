const _ = require('lodash');
const asyncOperationInProgressCheck = require('../lib/graceRequestHandler/asyncOperationInProgress');
const debug = require('debug')('push2cloud-cf-adapter:waitForServiceUnbound');

// CF error for not found service
//   serviice not found ---vv       vv--- service binding not found
const SERVICE_NOT_FOUND = [120003, 90004];

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
    }, asyncOperationInProgressCheck, (err, response, result) => {
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
          }, asyncOperationInProgressCheck, (err, response, result) => {
            if (err) {
              return callback(err);
            }

            if (api.actualDeploymentConfig) {
              _.remove(api.actualDeploymentConfig.serviceBindings, { guid: options.serviceBindingGuid });
            }

            let attempt = 0;
            (function retry() {
              setTimeout(() => {
                api.getServiceBinding({ serviceBindingGuid: options.serviceBindingGuid }, (retryError) => {
                  if (retryError && SERVICE_NOT_FOUND.includes(retryError.code)) {
                    return callback(null, result);
                  }

                  if (attempt >= options.maxRetries) {
                    return callback(new Error(`Waiting for unbind service ${options.name || options.serviceInstanceGuid} timed out!`));
                  }

                  attempt++;
                  debug(`${attempt}. retry for ${options.name || options.serviceInstanceGuid}`);

                  retry();
                });
              }, options.interval * 1000);
            }());
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
