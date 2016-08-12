const _ = require('lodash');

module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    if (!api.spaceGuid) {
      return callback(new Error('Please provide a space! \n' + JSON.stringify(options, null, 2)));
    }

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
      uri: `/v2/apps/${options.appGuid}`
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      var appIdx = _.findIndex(api.actualDeploymentConfig.apps, { guid: result.entity.guid });
      if (appIdx < 0) appIdx = api.actualDeploymentConfig.apps.length;

      var indexOfVersion = result.entity.name.lastIndexOf('-');
      var unversionedName = result.entity.name;
      if (indexOfVersion >= 0) unversionedName = result.entity.name.substring(0, indexOfVersion);

      api.actualDeploymentConfig.apps[appIdx] = {
        name: result.entity.name,
        unversionedName: unversionedName,
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
