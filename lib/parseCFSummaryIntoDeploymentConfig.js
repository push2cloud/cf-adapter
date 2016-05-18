const _ = require('lodash');

module.exports = (summaryJSON) => {
  const actual = {
    apps: [],
    serviceBindings: [],
    services: [],
    // domains: {},
    routes: [],
    envVars: []
  };

  _.forEach(summaryJSON.services, (service) => {
    actual.services.push({
      name: service.name,
      guid: service.guid,
      type: service.service_plan.service.label,
      plan: service.service_plan.name
    });
  });

  _.forEach(summaryJSON.apps, (app) => {

    var indexOfVersion = app.name.lastIndexOf('-');
    var unversionedName = app.name;
    if (indexOfVersion >= 0) unversionedName = app.name.substring(0, indexOfVersion);

    actual.apps.push({
      name: app.name,
      unversionedName: unversionedName,
      guid: app.guid,
      instances: app.instances,
      memory: app.memory,
      disk: app.disk_quota,
      state: app.state,
      version: app.name.substring(app.name.lastIndexOf('-') + 1),
      package_state: app.package_state
    });

    _.forEach(app.service_names, (service) => {
      actual.serviceBindings.push({
        service: service,
        serviceInstanceGuid: _.find(actual.services, { name: service }).guid,
        app: app.name,
        unversionedName: unversionedName,
        appGuid: app.guid
      });
    });

    var env = {
      env: {},
      name: app.name,
      unversionedName: unversionedName
    };
    _.forIn(app.environment_json, (value, key) => env.env[key] = value);
    actual.envVars.push(env);

    _.forEach(app.routes, (route) => {
      var foundRoute = _.findIndex(actual.routes, { guid: route.guid });
      var newRoute = {
        guid: route.guid,
        domain: route.domain.name,
        domainGuid: route.domain.guid,
        hostname: route.host,
        app: app.name,
        unversionedName: unversionedName,
        appGuid: app.guid
      };
      if (foundRoute >= 0) {
        actual.routes[foundRoute] = newRoute;
      } else {
        actual.routes.push(newRoute);
      }
      // actual.domains[route.domain.name] = route.domain;
    });
  });

  actual.serviceBindings = _.sortBy(actual.serviceBindings, (serviceBinding) => `${serviceBinding.app}${serviceBinding.service}`);
  actual.routes = _.sortBy(actual.routes, (route) => `${route.app}${route.domain}${route.hostname}`);
  actual.envVars = _.sortBy(actual.envVars, (envVar) => `${envVar.app}${envVar.key}${envVar.value}`);

  return actual;
};
