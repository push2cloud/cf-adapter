const _ = require('lodash');

module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    if (!options.routeGuid && options.hostname && options.domain && api.actualDeploymentConfig) {
      var r = _.find(api.actualDeploymentConfig.routes, { hostname: options.hostname, domain: options.domain });
      if (r) {
        options.routeGuid = r.guid;
      }
    }

    if (!options.routeGuid) {
      return callback(new Error('Please provide a routeGuid \n' + JSON.stringify(options, null, 2)));
    }

    api.graceRequest({
      method: 'DELETE',
      uri: `/v2/routes/${options.routeGuid}`
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (api.actualDeploymentConfig) {
        _.remove(api.actualDeploymentConfig.routes, { guid: options.routeGuid });
      }

      callback(null, result);
    });
  };
};
