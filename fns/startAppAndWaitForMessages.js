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

    options.startTimeout = options.startTimeout || 90; //seconds

    var timer;

    const clb = _.once((err, res) => {
      clearTimeout(timer);
      if (err) return callback(err);
      callback(null, res);
    });

    timer = setTimeout(() => {
      clb(new Error(`Starting for app ${options.name || options.appGuid} took longer than ${options.startTimeout} seconds!`));
    }, 1000 * options.startTimeout);
    options.onReady = () => api.startApp({ appGuid: options.appGuid, name: options.name }, _.noop);
    api.tailAppLogsAndWaitFor(options, clb);
  };
};
