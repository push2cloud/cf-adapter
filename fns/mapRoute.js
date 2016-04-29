const _ = require('lodash');
const async = require('async');

module.exports = (api) => {
  const mapRoute = (options, callback) => {
    async.series(
      [  _.curry(api.createRoute, 2)(options)
      ,  _.curry(api.associateRoute, 2)(options)
      ]
    , callback
    );
  };

  return mapRoute;
};
