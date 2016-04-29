module.exports = (api) => {
  return (options, callback) => {
    if (!options.disk && !options.memory && !options.instances) {
      return callback(new Error('Please provide a scaling option! \n' + JSON.stringify(options, null, 2)));
    }

    api.updateApp(options, callback);
  };
};
