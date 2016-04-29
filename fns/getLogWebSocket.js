const WebSocket = require('ws');
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
      var err = new Error('Please provide an appGuid! \n' + JSON.stringify(options, null, 2));
      return callback(err);
    }

    var ws = new WebSocket(`${api.targetInfo.logging_endpoint}/tail/?app=${options.appGuid}`, {
      headers : {
        Authorization: `${api.token.token_type} ${api.token.access_token}`
      },
      origin: 'http://localhost'
    });

    ws.on('open', function open() {
      callback(null, ws);
    });

    ws.on('error', function error(err) {
      callback(err);
    });
  };
};
