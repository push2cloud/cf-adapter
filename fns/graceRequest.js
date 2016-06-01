const debug = require('debug')('push2cloud-cf-adapter:graceRequest');
const request = require('request');
const _ = require('lodash');

module.exports = (api) => {
  return (opt, callback) => {
    opt = opt || {};

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
          if (!err && response && (
            response.statusCode < 300/* ||
            result && result.code*/
          )) {
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
          // it seems, that sometimes statusCode is not a nubmer, therefore only ==
          if (response && response.statusCode == 400) {
            attempt++;
            debug(`${attempt}. retry`);
            return retry();
          }
          if (result && result.error_code && result.error_code.toLowerCase().indexOf('timeout') >= 0) {
            attempt++;
            debug(`${attempt}. retry`);
            return retry();
          }
          if (result && result.error_code === 'UnknownError') {
            attempt++;
            debug(`${attempt}. retry`);
            return retry();
          }

          if (result && (result.code === 1000 || result.error_description === 'Unable to verify token')) {
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

          if (result && _.includes([10001, 10006, 60016, 10011], result.code)) {
            attempt++;
            debug(`${attempt}. retry`);
            return retry();
          }

          if (result && result.error_code) {
            return callback(new Error(result.description), response, result);
          }

          if (err && err.code === 'ECONNRESET') {
            attempt++;
            debug(`${attempt}. retry`);
            return retry();
          }

          callback(err, response, result);
        });
      }, attempt * api.options.delay * api.options.delayFactor);
    })();
  };
};
