module.exports = (api) => {
  return (options, callback) => {
    api.updateApp({ state: 'STOPPED', appGuid: options.appGuid, name: options.name }, callback);
  };
};
