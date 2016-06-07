module.exports = (options) => {
  // const err = options.error;
  // const response = options.response;
  const result = options.result;
  // const infos = options.infos;
  // const attempt = options.attempt;

  if (result && result.error_code && result.error_code === 'CF-ServiceBrokerBadResponse') {
    return result.description || 'service broker bad response';
  }
};
