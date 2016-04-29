module.exports = (api) => {
  return (options, callback) => {
    options.state = 'STOPPED';
    api.updateApp(options, callback);
  };
};
