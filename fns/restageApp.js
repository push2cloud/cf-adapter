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
      method: 'POST',
      uri: `/v2/apps/${options.appGuid}/restage`
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (result.entity.name !== options.newName && options.newName) {
        delete _.remove(api.actualDeploymentConfig.apps, (a) => a.name === options.name);
      }

      var appIdx = _.findIndex(api.actualDeploymentConfig.apps, { name: result.entity.name });
      if (appIdx < 0) appIdx = api.actualDeploymentConfig.apps.length;
      api.actualDeploymentConfig.apps[appIdx] = {
        name: result.entity.name,
        guid: result.metadata.guid,
        instances: result.entity.instances,
        memory: result.entity.memory,
        disk: result.entity.disk_quota,
        state: result.entity.state,
        version: result.entity.name.substring(result.entity.name.lastIndexOf('-') + 1),
        package_state: result.entity.package_state
      };

      callback(null, result);
    });
  };
};
