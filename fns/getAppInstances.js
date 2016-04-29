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

    api.graceRequest({
      method: 'GET',
      // uri: `/v2/apps/${options.appGuid}/instances`
      uri: `/v2/apps/${options.appGuid}/stats`
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (!result) {
        return callback(new Error('No app instances info!'));
      }

      callback(null, result);
    });
  };
};
