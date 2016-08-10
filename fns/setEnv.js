module.exports = (api) => {
  return (options, callback) => {
    if (!options.env) {
      return callback(new Error('Please provide an env option! \n' + JSON.stringify(options, null, 2)));
    }

    api.updateApp({ env: options.env, appGuid: options.appGuid, name: options.name }, callback);
  };
};
