const debug = require('debug')('push2cloud-cf-adapter:stageApp');
const _ = require('lodash');

module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    if (!options.appGuid && options.name && api.actualDeploymentConfig) {
      var a = _.find(api.actualDeploymentConfig.apps, { name: options.name });
      if (a) {
        options.appGuid = a.guid;
      }
    }

    if (!options.appGuid) {
      return callback(new Error('Please provide an appGuid! \n' + JSON.stringify(options, null, 2)));
    }

    options.messages = ['Starting app instance', 'Uploading complete'];
    options.failMessages = ['staging failed'];

    options.stageTimeout = options.stageTimeout || 300; //seconds

    var attempt = 0;

    var timeoutMsg = `Staging for app ${options.name || options.appGuid} took longer than ${options.stageTimeout} seconds!`;

    (function retry() {
      var timer;
      var clb = _.once((err) => {
        clearTimeout(timer);
        if (err) {
          debug(err);

          if (!err.message || (err.message.indexOf(options.failMessages[0]) < 0 && err.message !== timeoutMsg)) {
            return callback(err);
          }

          if (attempt >= api.options.maxRetries) {
            return callback(err);
          }

          attempt++;
          debug(`${attempt}. retry`);

          retry();
          return api.restageApp({ appGuid: options.appGuid }, _.noop);
        }
        api.stopApp({ appGuid: options.appGuid }, callback);
      });
      timer = setTimeout(() => {
        clb(new Error(timeoutMsg));
      }, 1000 * options.stageTimeout);
      api.tailAppLogsAndWaitFor(options, clb);
    })();

    api.startApp({ appGuid: options.appGuid, name: options.name }, _.noop);
  };
};
