module.exports = (api) => {
  return (options, callback) => {
    api.stopApp(
      options,
      (err) => {
        if (err) return callback(err);
        api.startApp(options, callback);
      }
    );
  };
};
