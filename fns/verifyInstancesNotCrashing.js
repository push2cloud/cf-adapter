const debug = require('debug')('push2cloud-cf-adapter:verifyInstancesNotCrashing');
const _ = require('lodash');

function allInstancesRunning(instances) {
  return _.every(instances, (instance) => instance.state === 'RUNNING');
}

module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    options.gracePeriod = options.gracePeriod || 40;
    options.interval = options.interval || 4;
    options.maxRetries = options.maxRetries || Math.floor(options.gracePeriod / options.interval);

    if (!options.appGuid && options.name && api.actualDeploymentConfig) {
      var a = _.find(api.actualDeploymentConfig.apps, { name: options.name });
      if (a) {
        options.appGuid = a.guid;
      }
    }

    if (!options.appGuid) {
      return callback(new Error('Please provide an appGuid! \n' + JSON.stringify(options, null, 2)));
    }

    var attempt = 0;

    (function retry() {
      setTimeout(() => {
        api.getAppInstances(options, (err, instances) => {
          if (err) return callback(err);

          if (attempt >= options.maxRetries) {
            return callback(null);
          }

          var running = allInstancesRunning(instances);

          if (running) {
            attempt++;
            debug(`${attempt}. retry will try ${options.maxRetries} for ${options.name || options.appGuid}`);
            return retry();
          }

          callback(new Error(`${options.name || options.appGuid} crashed!`));
        });
      }, options.interval * 1000);
    })();
  };
};
