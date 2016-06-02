const swisscomHandler = require('./graceRequestHandler/swisscomHandler');

module.exports = (api, info) => {
  if (info && info.description && info.description.toLowerCase().indexOf('swisscom') >= 0) {
    api.attachRetryHandler(swisscomHandler);
  }
};
