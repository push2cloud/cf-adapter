const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const debug = require('debug')('push2cloud-cf-adapter');

const functions = [];
const functionsPath = path.join(__dirname, 'fns');

fs.readdirSync(functionsPath).forEach((fileName) => {
  var joinedPath = path.join(functionsPath, fileName);

  if (path.extname(fileName) === '.js') {
    var required = require(joinedPath);
    functions.push({ name: path.basename(fileName, '.js'), module: required });
  }
});

module.exports = (options) => {
  options = options || {};

  var defaults = {
    api: 'https://api.run.pivotal.io',
    rejectUnauthorized: true,
    maxRetries: 3,
    delay: 1000,
    delayFactor: 1
  };

  _.defaults(options, defaults);

  const api = { options };

  functions.forEach((fn) => {
    const orgFn = fn.module(api);
    api[fn.name] = function(opts) {
      var additionalInfos;
      if (opts) {
        if (opts.name) additionalInfos = ' ' + opts.name;
        if (!additionalInfos && opts.app) additionalInfos = ' ' + opts.app;
        if (!additionalInfos && opts.hostname) additionalInfos = ' ' + opts.hostname;
        if (!additionalInfos) additionalInfos = '';
      }

      if (arguments.length === 0 || typeof arguments[arguments.length - 1] !== 'function') {
        var args = _.toArray(arguments);
        // called as promise..
        debug(`called ${fn.name} as promise...${additionalInfos}`);
        return new Promise((resolve, reject) => {
          args.push(function(err) {
            var responseArgs = _.toArray(arguments);
            responseArgs.shift();
            if (err) {
              return reject(err);
            }
            if (responseArgs.length === 0) {
              return resolve();
            }
            if (responseArgs.length === 1) {
              return resolve(responseArgs[0]);
            }
            resolve(responseArgs);
          });
          orgFn.apply(api, args);
        });
      } else {
        // called normally...
        debug(`called ${fn.name}...${additionalInfos}`);
        orgFn.apply(api, arguments);
      }
    };
  });

  return api;
};
