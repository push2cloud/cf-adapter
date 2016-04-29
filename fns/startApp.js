module.exports = (api) => {
  return (options, callback) => {
    options.state = 'STARTED';
    api.updateApp(options, callback);
  };
};
