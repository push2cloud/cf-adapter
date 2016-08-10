module.exports = (api) => {
  return (options, callback) => {
    api.updateApp({ state: 'STARTED', appGuid: options.appGuid, name: options.name }, callback);
  };
};
