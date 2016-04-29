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
      method: 'DELETE',
      uri: `/v2/apps/${options.appGuid}`
    }, (err, response, result) => {
      var appIdx;
      if (result && result.code === 100004) {
        appIdx = _.findIndex(api.actualDeploymentConfig.apps, { guid: options.appGuid });
        if (appIdx) {
          delete api.actualDeploymentConfig.apps[appIdx];
          return callback(null);
        } else {
          return callback(new Error(result.description));
        }
      }

      if (err && !(result && result.code === 100004)) {
        return callback(err);
      }

      appIdx = _.findIndex(api.actualDeploymentConfig.apps, { guid: options.appGuid });
      delete api.actualDeploymentConfig.apps[appIdx];

      callback(null, result);
    });
  };
};
