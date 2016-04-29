const debug = require('debug')('push2cloud-cf-adapter:init');
const _ = require('lodash');

module.exports = (api) => {
  function reinit(callback) {
    if (api.inited) {
      return callback(null);
    }

    api.logout = () => {
      api.loggedOut = true;
      if (api.loginRefreshHandle) clearTimeout(api.loginRefreshHandle);
    };

    api.loggedOut = false;

    if (!api.targetInfo) {
      api.getInfo((err, info) => {
        if (err) return callback(err);
        debug(info);
        api.targetInfo = info;
        reinit(callback);
      });
      return;
    }

    if (!api.token) {
      api.login((err, token) => {
        if (err) return callback(err);
        api.token = token;

        (function refresh() {
          if (api.loggedOut) return;
          api.loginRefreshHandle = setTimeout(() => {
            api.refreshLogin((err, refreshedToken) => {
              if (err) return debug(err);
              api.token = refreshedToken;
              refresh();
            });
          }, api.token.expires_in * 1000 * 0.5);
        })();

        reinit(callback);
      });
      return;
    }

    if (!api.orgGuid) {
      api.getOrgInfo((err, orgInfo) => {
        if (err) return callback(err);
        api.orgInfo = orgInfo;
        api.orgGuid = orgInfo.metadata.guid;
        reinit(callback);
      });
      return;
    }

    if (!api.spaceGuid) {
      api.getSpaceInfo((err, spaceInfo) => {
        if (err) return callback(err);
        api.spaceInfo = spaceInfo;
        api.spaceGuid = spaceInfo.metadata.guid;
        reinit(callback);
      });
      return;
    }

    if (!api.services) {
      api.getServices((err, services) => {
        if (err) return callback(err);
        api.services = services;
        reinit(callback);
      });

      api.getService = (serviceName) => {
        const service = _.find(api.services, { entity: { label: serviceName } });
        return service;
      };

      api.getServicePlan = (serviceName, planName) => {
        const service = api.getService(serviceName);
        if (!service || !service.servicePlans) return null;
        const servicePlan = _.find(service.servicePlans, { entity: { name: planName } });
        if (!servicePlan) return null;
        return servicePlan;
      };

      return;
    }

    if (!api.domains) {
      api.getDomains((err, domains) => {
        if (err) return callback(err);
        api.domains = domains;
        reinit(callback);
      });
      return;
    }

    if (!api.actualDeploymentConfig) {
      api.getActualDeploymentConfig((err) => {
        if (err) return callback(err);
        reinit(callback);
      });
      return;
    }

    api.inited = true;

    callback(null, _.cloneDeep(api.actualDeploymentConfig));
  }

  return reinit;
};
