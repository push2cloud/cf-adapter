const debug = require('debug')('push2cloud-cf-adapter:graceRequest');
const request = require('request');
const _ = require('lodash');
const notAuthenticatedCheck = require('../lib/notAuthenticated');
const commonRetryChecks = [
  require('../lib/graceRequestHandler/connectionReset'),
  require('../lib/graceRequestHandler/timeout')
];

module.exports = (api) => {
  return (opt, retryFns, callback) => {
    opt = opt || {};

    if (!callback) {
      callback = retryFns;
      retryFns = null;
    }
    if (!retryFns) retryFns = [];
    if (_.isFunction(retryFns)) retryFns = [retryFns];

    retryFns = commonRetryChecks.concat(retryFns).concat(api.graceRequestHandlers);

    var defaults = {
      method: 'GET',
      baseUrl: api.options.api,
      rejectUnauthorized: api.options.rejectUnauthorized,
      json: true,
      headers: api.token ? {
        Authorization: `${api.token.token_type} ${api.token.access_token}`
      } : undefined
    };

    _.defaults(opt, defaults);

    var attempt = 0;

    (function retry() {
      setTimeout(() => {
        request(opt, (err, response, result) => {
          if (err) debug(err, result, opt);
          if (!err && response && response.statusCode < 300) {
            return callback(err, response, result);
          }
          if (attempt >= api.options.maxRetries) {
            if (result && result.error_code) {
              return callback(new Error(result.description), response, result);
            }
            return callback(err, response, result);
          }
          if (response) {
            debug(`StatusCode: ${response.statusCode}`);
            debug(err, result, opt);
          }

          const toCheck = {
            error: err,
            response: response,
            result: result,
            attempt: attempt,
            infos: opt
          };

          if (notAuthenticatedCheck(toCheck)) {
            api.login((err, refreshedToken) => {
              if (err) {
                debug(err);
                return callback(err);
              }
              if (refreshedToken) {
                api.token = refreshedToken;
              }

              opt.headers = api.token ? {
                Authorization: `${api.token.token_type} ${api.token.access_token}`
              } : undefined;

              attempt++;
              debug(`${attempt}. retry`);
              retry();
            });
            return;
          }

          var shouldRetry = false;
          _.some(retryFns, (fn) => {
            shouldRetry = fn(toCheck);
            return !!shouldRetry;
          });

          if (shouldRetry) {
            attempt++;
            var reason = '';
            if (_.isString(shouldRetry)) reason = ` reason: ${shouldRetry}`;
            debug(`${attempt}. retry${reason}`);

            api.stats.emit('retry', {
              error: toCheck.error,
              response: toCheck.response,
              result: toCheck.result,
              attempt: toCheck.attempt,
              infos: toCheck.infos,
              reason: reason
            });

            return retry();
          }

          if (result && result.error_code) {
            return callback(new Error(result.description), response, result);
          }

          callback(err, response, result);
        });
      }, attempt * api.options.delay * api.options.delayFactor);
    })();
  };
};
