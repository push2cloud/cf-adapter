const _ = require('lodash');
const async = require('async');

module.exports = (api) => {
  return (options, callback) => {
    async.series([
      _.curry(api.disassociateRoute, 2)(options)
    , _.curry(api.deleteRoute, 2)(options)
    ],
    callback);
  };
};
