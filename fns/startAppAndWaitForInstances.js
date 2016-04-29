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

    api.startAppAndWaitForCompleteMessage(_.clone(options), (err) => {
      if (err) return callback(err);

      api.waitForAllInstancesRunning(_.clone(options), (err) => {
        if (err) return callback(err);

        api.verifyInstancesNotCrashing(_.clone(options), callback);
      });
    });
  };
};
