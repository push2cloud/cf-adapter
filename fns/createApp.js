const _ = require('lodash');
const convertSize = require('../lib/convertSize');
const semver = require('semver');
const debug = require('debug')('push2cloud-cf-adapter:createApp');

module.exports = (api) => {
  const create = (options, callback) => {
    const defaults = {
      buildpack: null,
      command: null,
      env: {},
      disk: '256M',
      memory: '256M',
      instances: 1
    };

    _.defaults(options, defaults);

    if (!api.spaceGuid) {
      return callback(new Error('Please provide an space! \n' + JSON.stringify(options, null, 2)));
    }

    if (!options.name) {
      return callback(new Error('Please provide a name! \n' + JSON.stringify(options, null, 2)));
    }

    function updateActualDeploymentConfig(result) {
      var appIdx = _.findIndex(api.actualDeploymentConfig.apps, { name: result.entity.name });
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
        version: semver.valid(result.entity.name.substring(result.entity.name.lastIndexOf('-') + 1)) ? result.entity.name.substring(result.entity.name.lastIndexOf('-') + 1) : undefined,
        package_state: result.entity.package_state
      };
    }

    api.graceRequest({
      method: 'POST',
      uri: '/v2/apps',
      json : {
        name: options.name,
        space_guid: api.spaceGuid,
        buildpack: options.buildpack,
        command: options.command,
        environment_json: options.env,
        disk_quota: convertSize(options.disk) || defaults.disk,
        memory: convertSize(options.memory) || defaults.memory,
        instances: convertSize(options.instances) || defaults.instances
      }
    }, (err, response, result) => {
      if (result && result.code === 100002) {
        if (!_.find(api.actualDeploymentConfig.apps, { name: options.name })) {
          api.getAppInfo(options, (err, result) => {
            if (err) {
              return callback(err);
            }

            if (!result || !result.metadata || !result.metadata.guid) {
              debug('Missing app infos!');
              return callback(new Error('Missing app infos!'));
            }

            updateActualDeploymentConfig(result);
            callback(null, result);
          });
          return;
        } else {
          return callback(new Error(result.description));
        }
      }

      if (err && !(result && result.code === 10002)) {
        return callback(err);
      }

      updateActualDeploymentConfig(result);

      callback(null, result);
    });
  };

  return create;
};
