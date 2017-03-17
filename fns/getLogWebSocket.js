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

    var url = `${api.targetInfo.logging_endpoint}/tail/?app=${options.appGuid}`;
    if (api.targetInfo.doppler_logging_endpoint) {
      url = `${api.targetInfo.doppler_logging_endpoint}/apps/${options.appGuid}/stream`;
    }

    var ws = new WebSocket(url, {
      headers : {
        Authorization: `${api.token.token_type} ${api.token.access_token}`
      },
      origin: 'http://localhost',
      rejectUnauthorized: api.options.rejectUnauthorized
    });

    ws.on('open', function open() {
      callback(null, ws);
    });

    ws.on('error', function error(err) {
      callback(err);
    });
  };
};
