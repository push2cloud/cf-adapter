const _ = require('lodash');

module.exports = (input) => {
  if (_.isNumber(input)) return input;
  if (_.isString(input)) {
    var multipliers = {
      M: 1,
      G: 1024
    };
    var matches = input.toUpperCase().match(/(\d+)([MG]?)B?$/);
    var value = parseInt(matches[1]);
    var unit = matches[2];
    return value * (multipliers[unit] || 1);
  }
  return null;
};
