const unknownError = require('./unknownError');
const serviceBrokerError = require('./serviceBrokerError');
const databaseError = require('./databaseError');

module.exports = (options) => {
  // const err = options.error;
  // const response = options.response;
  // const result = options.result;
  const infos = options.infos;
  // const attempt = options.attempt;

  if (infos.method === 'DELETE') {
    return unknownError(options) || serviceBrokerError(options);
  }

  if (infos.uri.indexOf('/service_bindings') >= 0) {
    return unknownError(options);
  }

  if (infos.uri.indexOf('/service_instances') >= 0) {
    return databaseError(options);
  }
};
