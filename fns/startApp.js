module.exports = (api) => {
  return (options, callback) => {
    api.updateApp({ state: 'STARTED', appGuid: options.appGuid, name: options.name }, (err, res) => {
      if (!err) return callback(err, res);
      // just retry once again
      api.updateApp({ state: 'STARTED', appGuid: options.appGuid, name: options.name }, callback);
    });
  };
};
