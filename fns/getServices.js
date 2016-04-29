const async = require('async');

module.exports = (api) => {
  return (callback) => {
    api.graceRequest({
      method: 'GET',
      uri: '/v2/services'
    }, (err, response, result) => {
      if (err) {
        return callback(err);
      }

      if (!result || result.total_results === 0) {
        return callback(new Error('No service plans!'));
      }

      async.each(result.resources, (service, callback) => {
        api.getServicePlans({ serviceId: service.metadata.guid }, (err, res) => {
          if (err) return callback(err);
          service.servicePlans = res;
          callback(null);
        });
      }, (err) => {
        if (err) return callback(err);
        callback(null, result.resources);
      });
    });
  };
};
