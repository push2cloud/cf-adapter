const _ = require('lodash');
const debug = require('debug')('push2cloud-cf-adapter:createRoute');

module.exports = (api) => {
  const create = (options, callback) => {
    options = options || {};

    if (!api.spaceGuid) {
      return callback(new Error('Please provide a space! \n' + JSON.stringify(options, null, 2)));
    }

    if (!options.domainGuid && !options.domain) {
      return callback(new Error('Please provide a domain! \n' + JSON.stringify(options, null, 2)));
    }

    if (!options.hostname) {
      return callback(new Error('Please provide a host! \n' + JSON.stringify(options, null, 2)));
    }

    if (!options.domainGuid) {
      var dom = _.find(api.domains, { entity: { name: options.domain } });

      if (!dom) {
        return callback(new Error('Please provide a domainGuid! \n' + JSON.stringify(options, null, 2)));
      }

      options.domainGuid = dom.metadata.guid;
    }

    api.graceRequest({
      method: 'POST',
      uri: '/v2/routes',
      json: {
        domain_guid: options.domainGuid,
        space_guid: api.spaceGuid,
        host: options.hostname
      }
    }, (err, response, result) => {
      if (result && result.code === 210003) {
        if (!_.find(api.actualDeploymentConfig.routes, { domainGuid: options.domainGuid,
                                                         hostname: options.hostname })) {
          api.getRoutes(options, (err, results) => {
            if (err) {
              return callback(err);
            }

            if (!results || results.length === 0) {
              debug('Missing route infos!');
              return callback(new Error('Missing route infos!'));
            }

            var r = _.find(results, (item) => {
              return item.entity.domain_guid === options.domainGuid
                  && item.entity.host === options.hostname;
            });

            if (!r) {
              debug('Missing route infos!');
              return callback(new Error('Missing route infos!'));
            }

            var dName;
            if (api.actualDeploymentConfig) {
              var d = _.find(api.actualDeploymentConfig.domains, { guid: options.domainGuid });
              if (d) dName = d.name;
            }

            api.actualDeploymentConfig.routes.push({
              guid: r.metadata.guid,
              domainGuid: options.domainGuid,
              appGuid: undefined,
              hostname: options.hostname,
              domain: dName,
              app: undefined
            });

            callback(null, r);
          });
          return;
        } else {
          return callback(new Error(result.description));
        }
      }

      if (err && !(result && result.code === 210003)) {
        return callback(err);
      }

      var dName;
      if (api.actualDeploymentConfig) {
        var d = _.find(api.actualDeploymentConfig.domains, { guid: options.domainGuid });
        if (d) dName = d.name;
      }

      api.actualDeploymentConfig.routes.push({
        guid: result.metadata.guid,
        domainGuid: options.domainGuid,
        appGuid: undefined,
        hostname: options.hostname,
        domain: dName,
        app: undefined
      });

      callback(null, result);
    });
  };

  return create;
};
