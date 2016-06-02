const debug = require('debug')('push2cloud-cf-adapter:autoAttachRetryHandler');
const swisscomHandler = require('./graceRequestHandler/swisscomHandler');

module.exports = (api, info) => {
  if (info && info.description && info.description.toLowerCase().indexOf('swisscom') >= 0) {
    debug('attaching swisscom retry handler...');
    api.attachRetryHandler(swisscomHandler);
  }
};
