const _ = require('lodash');
const debug = require('debug')('push2cloud-cf-adapter:pushApp');

module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    var app = null;
    if (api.actualDeploymentConfig) {
      if (options.appGuid) {
        app = _.find(api.actualDeploymentConfig.apps, { id: options.appGuid });
      } else if (!options.appGuid && options.name) {
        app = _.find(api.actualDeploymentConfig.apps, { name: options.name });
      }
    }

    if (app) {
      debug('seems like the app does already exist, so just continue to push/upload...');
      if (!options.path) {
        debug('skip to upload app, because no path set for:', options);
        return callback(null, null);
      }
      options.appGuid = app.id;
      api.uploadApp(options, (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
      return;
    }

    api.createApp(options, (err, result) => {
      if (err) return callback(err);
      if (!options.path) {
        debug('skip to upload app, because no path set for:', options);
        return callback(null, result);
      }
      options.appGuid = result.metadata.guid;
      api.uploadApp(options, (err) => {
        if (err) return callback(err);
        callback(null, result);
      });
    });
  };
};
