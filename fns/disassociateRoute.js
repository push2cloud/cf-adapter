const _ = require('lodash');

module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    if (!options.appGuid && options.app && api.actualDeploymentConfig) {
      var a = _.find(api.actualDeploymentConfig.apps, { name: options.app });
      if (a) {
        options.appGuid = a.guid;
      }
    }

    if (!options.routeGuid && options.hostname && options.domain && api.actualDeploymentConfig) {
      var r = _.find(api.actualDeploymentConfig.routes, { hostname: options.hostname, domain: options.domain });
      if (r) {
        options.routeGuid = r.guid;
      }
    }

    if (!options.appGuid) {
      return callback(new Error('Please provide an appGuid! \n' + JSON.stringify(options, null, 2)));
    }

    if (!options.routeGuid) {
      return callback(new Error('Please provide an routeGuid! \n' + JSON.stringify(options, null, 2)));
    }

    api.graceRequest({
      method: 'DELETE',
      uri: `/v2/apps/${options.appGuid}/routes/${options.routeGuid}`
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (api.actualDeploymentConfig) {
        var r = _.find(api.actualDeploymentConfig.routes, { guid: options.routeGuid });
        r.appGuid = undefined;
        r.app = undefined;
      }

      callback(null, result);
    });
  };
};
