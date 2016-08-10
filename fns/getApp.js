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
      method: 'GET',
      uri: `/v2/apps/${options.appGuid}`
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      callback(null, result);
    });
  };
};
