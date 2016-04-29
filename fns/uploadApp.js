const _ = require('lodash');
const debug = require('debug')('push2cloud-cf-adapter:uploadApp');
const fs = require('fs');
const zipGenerator = require('../lib/zipGenerator');

module.exports = (api) => {
  return (options, callback) => {
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

    if (!options.path) {
      return callback(new Error('Please provide an path! \n' + JSON.stringify(options, null, 2)));
    }

    var defaults = {
      async: false,
      zipResources: [],
      tmpZipPath: options.path + '.zip.tmp'
    };

    _.defaults(options, defaults);

    zipGenerator(options.path, options.tmpZipPath, (err) => {
      if (err) return callback(err);

      api.graceRequest({
        method: 'PUT',
        uri: `/v2/apps/${options.appGuid}/bits`,
        qs: {
          async: options.async
        },
        formData: {
          resources: JSON.stringify(options.zipResources),
          application: fs.createReadStream(options.tmpZipPath)
        },
        json: false
      }, (err, response, result) => {
        fs.unlink(options.tmpZipPath, (err) => {
          if (err) debug(err);
        });

        if (err) {
          return callback(err);
        }

        callback(null, result);
      });
    });
  };
};
