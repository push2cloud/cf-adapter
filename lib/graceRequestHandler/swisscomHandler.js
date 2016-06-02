const unknownError = require('./unknownError');

module.exports = (options) => {
  // const err = options.error;
  // const response = options.response;
  // const result = options.result;
  const infos = options.infos;
  // const attempt = options.attempt;

  if (infos.uri.indexOf('/service_bindings') >= 0) {
    return unknownError(options);
  }
};
