const async = require('async');
const _ = require('lodash');
const parseCFSummaryIntoDeploymentConfig = require('../lib/parseCFSummaryIntoDeploymentConfig');

module.exports = (api) => {
  return (done) => {
    api.getSpaceSummary((err, summary) => {
      if (err) return done(err);

      if (!summary) return done(null);

      const deploymentConfig = parseCFSummaryIntoDeploymentConfig(summary);

      async.each(deploymentConfig.services, (service, callback) => {
        api.getServiceBindings({
          serviceInstanceGuid: service.guid
        }, (err, result) => {
          if (err) return callback(err);

          if (result.length > 0) {
            _.each(result, (b) => {
              var binding = _.find(deploymentConfig.serviceBindings, {
                serviceInstanceGuid: b.entity.service_instance_guid,
                appGuid: b.entity.app_guid
              });
              if (binding) {
                binding.guid = b.metadata.guid;
              }
            });
          }

          callback(null);
        });
      }, (err) => {
        if (err) return done(err);

        api.getDomains((err, domains) => {
          if (err) return done(err);
          api.domains = domains;

          deploymentConfig.domains = _.map(domains, (d) => {
            return { guid: d.metadata.guid, name: d.entity.name };
          });

          api.actualDeploymentConfig = deploymentConfig;


          api.getRoutes((err, routes) => {
            if (err) return done(err);

            const newRoutes = _.map(routes, (route) => {
              const dom = _.find(deploymentConfig.domains, { guid: route.entity.domain_guid });
              var foundRoute = _.find(deploymentConfig.routes, { guid: route.metadata.guid });
              if (foundRoute) {
                return foundRoute;
              }
              return {
                guid: route.metadata.guid,
                domain: dom ? dom.name : undefined,
                domainGuid: route.entity.domain_guid,
                hostname: route.entity.host
              };
            });
            api.routes = newRoutes;
            deploymentConfig.routes = newRoutes;

            api.actualDeploymentConfig = deploymentConfig;

            done(null, deploymentConfig);
          });
        });
      });
    });
  };
};
