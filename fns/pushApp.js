const debug = require('debug')('push2cloud-cf-adapter:pushApp');

module.exports = (api) => {
  return (options, callback) => {
    api.createApp(options, (err, result) => {
      if (err) return callback(err);
      if (!options.path) {
        debug('skip to upload app, because no path set for:', options);
        return callback(null, result);
      }
      options.appGuid = result.metadata.guid;
      api.uploadApp(options, (err) => {
        if (err) return callback(err);
        callback(null, result);
      });
    });
  };
};
