const _ = require('lodash');
const debug = require('debug')('push2cloud-cf-adapter:uploadApp');
const fs = require('fs');
const join = require('path').join;
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

    var isFile = false;
    if (options.appBits) {
      options.path = join(options.path, options.appBits);
      if (fs.lstatSync(options.path).isFile()) {
        isFile = true;
      }
    }

    var defaults = {
      async: false,
      zipResources: [],
      tmpZipPath: options.path + '.zip.tmp'
    };

    _.defaults(options, defaults);

    const upload = (options) => api.graceRequest({
      method: 'PUT',
      uri: `/v2/apps/${options.appGuid}/bits`,
      qs: {
        async: options.async
      },
      formData: {
        resources: JSON.stringify(options.zipResources),
        application: fs.createReadStream(options.path)
      },
      json: false
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      callback(null, result);
    });

    if (isFile) {
      upload(options);
    } else {
      zipGenerator(options.path, options.tmpZipPath, (err) => {
        if (err) return callback(err);
        options.path = options.tmpZipPath;
        upload(options);
      });
    }
  };
};
