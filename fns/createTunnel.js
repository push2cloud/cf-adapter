const _ = require('lodash');
const tunnel = require('tunnel-ssh');

module.exports = (api) => {
  return (options, callback) => {
    options = options || {};

    if (!api.spaceGuid) {
      return callback(new Error('Please provide a space! \n' + JSON.stringify(options, null, 2)));
    }

    if (!options.appGuid && options.app && api.actualDeploymentConfig) {
      var a = _.find(api.actualDeploymentConfig.apps, { name: options.app });
      if (a) {
        options.appGuid = a.guid;
      }
    }

    if (!options.appGuid) {
      return callback(new Error('Please provide an appGuid! \n' + JSON.stringify(options, null, 2)));
    }

    if (!options.destinationHost) {
      return callback(new Error('Please provide an destinationHost! \n' + JSON.stringify(options, null, 2)));
    }

    if (!options.destinationPort) {
      return callback(new Error('Please provide an destinationPort! \n' + JSON.stringify(options, null, 2)));
    }

    if (!api.targetInfo.app_ssh_endpoint) {
      return callback(new Error('No app_ssh_endpoint defined in targetInfo!'));
    }

    const sshEndpoint = api.targetInfo.app_ssh_endpoint.split(':');
    const sshHost = sshEndpoint[0];
    const sshPort = parseInt(sshEndpoint[1]);

    options.instance = options.instance || 0;

    api.getCode((err, code) => {
      if (err) return callback(err);

      const config = {
        username: `cf:${options.appGuid}/${options.instance}`,
        password: code,
        host: sshHost,
        port: sshPort,
        dstHost: options.destinationHost,
        dstPort: options.destinationPort,
        localPort: options.localPort
      };

      tunnel(config, (err, tnl) => {
        if (err) return callback(err);
        callback(null, tnl);
      });
    });
  };
};
