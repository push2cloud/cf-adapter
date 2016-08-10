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

    var json = {};
    if (options.newName) json.name = options.newName;
    if (options.spaceGuid) json.space_guid = options.spaceGuid;
    if (options.buildpack) json.buildpack = options.buildpack;
    if (options.command) json.command = options.command;
    if (options.environment_json) json.env = options.env;
    if (options.disk_quota) json.disk = options.disk;
    if (options.memory) json.memory = options.memory;
    if (options.instances) json.instances = options.instances;
    if (options.state) json.state = options.state;
    api.graceRequest({
      method: 'PUT',
      uri: `/v2/apps/${options.appGuid}`,
      json : json
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

      proceed();
    });
  };
};
