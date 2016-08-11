const convertSize = require('../lib/convertSize');
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
      method: 'PUT',
      uri: `/v2/apps/${options.appGuid}`,
      json: {
        name: options.newName,
        space_guid: api.spaceGuid,
        buildpack: options.buildpack,
        command: options.command,
        environment_json: options.env || undefined,
        disk_quota: convertSize(options.disk) || undefined,
        memory: convertSize(options.memory) || undefined,
        instances: convertSize(options.instances) || undefined,
        state: options.state
      }
    }, (err, response, result) => {
      if (err) {
        if (options.state !== 'STOPPED' || !result || result.error_code !== 'UnknownError') {
          return callback(err);
        }

        api.getApp({ appGuid: options.appGuid }, (errInfo, resultInfo) => {
          if (errInfo || !resultInfo || !resultInfo.entity) return callback(err);

          if (resultInfo.entity.state !== 'STOPPED') {
            return callback(err);
          }

          proceed(resultInfo);
        });
        return;
      }

      function proceed(res) {
        if (res.entity.name !== options.newName && options.newName) {
          delete _.remove(api.actualDeploymentConfig.apps, (a) => a.name === options.name);
        }

        var appIdx = _.findIndex(api.actualDeploymentConfig.apps, { name: res.entity.name });
        if (appIdx < 0) appIdx = api.actualDeploymentConfig.apps.length;

        var indexOfVersion = res.entity.name.lastIndexOf('-');
        var unversionedName = res.entity.name;
        if (indexOfVersion >= 0) unversionedName = res.entity.name.substring(0, indexOfVersion);

        api.actualDeploymentConfig.apps[appIdx] = {
          name: res.entity.name,
          unversionedName: unversionedName,
          guid: res.metadata.guid,
          instances: res.entity.instances,
          memory: res.entity.memory,
          disk: res.entity.disk_quota,
          state: res.entity.state,
          version: res.entity.name.substring(res.entity.name.lastIndexOf('-') + 1),
          package_state: res.entity.package_state
        };

        callback(null, res);
      }

      proceed(result);
    });
  };
};
