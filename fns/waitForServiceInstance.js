const debug = require('debug')('push2cloud-cf-adapter:waitForServiceInstance');

module.exports = (api) => {
  return (options, callback) => {
    options = options || {};
    options.timeout = options.timeout || 30;
    options.interval = options.interval || 3;
    options.maxRetries = options.maxRetries || api.options.maxRetries || Math.floor(options.timeout / options.interval);

    var attempt = 0;

    (function retry() {
      setTimeout(() => {
        api.getServiceInstance(options, (err, result) => {
          if (err) return callback(err);

          if (result && result.entity && result.entity.last_operation && result.entity.last_operation.state == 'succeeded') {
            return callback(null);
          }

          if (attempt >= options.maxRetries) {
            return callback(new Error(`Waiting for service ${options.name || options.serviceInstanceGuid} timeouted!`));
          }

          attempt++;
          debug(`${attempt}. retry for ${options.name || options.serviceInstanceGuid}`);

          retry();
        });
      }, options.interval * 1000);
    })();
  };
};
