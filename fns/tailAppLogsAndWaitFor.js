const debug = require('debug')('push2cloud-cf-adapter:tailAppLogsAndWaitFor');
const _ = require('lodash');

module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    if (!options.appGuid && options.name && api.actualDeploymentConfig) {
      var a = _.find(api.actualDeploymentConfig.apps, { name: options.name });
      if (a) {
        options.appGuid = a.guid;
      }
    }

    if (!options.appGuid) {
      return callback(new Error('Please provide an appGuid! \n' + JSON.stringify(options, null, 2)));
    }

    if (!options.messages || options.messages.length === 0) {
      return callback(new Error('Please provide a messages option! \n' + JSON.stringify(options, null, 2)));
    }

    api.getLogWebSocket(options, (err, ws) => {
      if (err) return callback(err);

      if (options.onReady) options.onReady();

      ws.on('message', (data) => {
        const stringData = data.toString();
        debug(`${options.name || options.appGuid} log: ${stringData}`);
        const found = _.find(options.messages, (k) => {
          return stringData.indexOf(k) >= 0;
        });
        if (found) {
          debug(`Token ${stringData} in app log detected`);
          ws.close();
          callback(null, stringData);
        }

        if (options.failMessages) {
          const foundErr = _.find(options.failMessages, (k) => {
            return stringData.indexOf(k) >= 0;
          });
          if (foundErr) {
            debug(`Token ${stringData} in app log detected`);
            ws.close();
            callback(new Error(stringData));
          }
        }
      });
      ws.on('open', () => {
        debug(`Listening on log for app ${options.name || options.appGuid}`);
      });
      ws.on('error', callback);
    });
  };
};
