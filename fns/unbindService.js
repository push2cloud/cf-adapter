const _ = require('lodash');
const asyncOperationInProgressCheck = require('../lib/graceRequestHandler/asyncOperationInProgress');
const debug = require('debug')('push2cloud-cf-adapter:waitForServiceUnbound');

// CF error for not found service
//   service not found ---vv       vv--- service binding not found
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
          if (!result) {
            debug(`Unable to find service binding ${options.name || options.serviceBindingGuid}`);
            return callback(err);
          }

          api.graceRequest({
            method: 'DELETE',
            uri: `/v2/service_bindings/${options.serviceBindingGuid}`
          }, asyncOperationInProgressCheck, (err, response, result) => {
            if (err) {
              return callback(err);
            }

            waitForServiceUnbound(options.serviceBindingGuid, result);
          });
        });
      }

      waitForServiceUnbound(options.serviceBindingGuid, result);
    });

    let attempt = 0;
    const retryOptions = {
      maxRetries: 5,
      interval: 3
    };
    function waitForServiceUnbound(serviceBindingGuid, originalResult) {
      setTimeout(function() {
        api.getServiceBinding({ serviceBindingGuid: serviceBindingGuid }, (newError, result) => {
          if (SERVICE_NOT_FOUND.includes(newError.code)) {
            if (api.actualDeploymentConfig) {
              _.remove(api.actualDeploymentConfig.serviceBindings, { guid: options.serviceBindingGuid });
            }
            return callback(null, originalResult);
          }

          if (attempt >= retryOptions.maxRetries) {
            return callback(new Error(`Check if service was successfully unbound ${options.name || options.serviceBindingGuid} timed out! Most likely a swisscom issue.`));
          }

          attempt++;
          debug(`${attempt}. retry to check if service was successfully unbound ${options.name || options.serviceBindingGuid}`);

          waitForServiceUnbound(serviceBindingGuid, originalResult);
        });
      }, retryOptions.interval * 1000);
    }
  };
};
