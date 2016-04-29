module.exports = (api) => {
  return (options, callback) => {
    api.createApp(options, (err, result) => {
      if (err) return callback(err);
      options.appGuid = result.metadata.guid;
      api.uploadApp(options, (err) => {
        if (err) return callback(err);
        callback(null, result);
      });
    });
  };
};
