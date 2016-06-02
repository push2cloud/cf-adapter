module.exports = (options) => {
  const err = options.error;
  // const response = options.response;
  // const result = options.result;
  // const infos = options.infos;
  // const attempt = options.attempt;

  if (err && err.code === 'ECONNRESET') {
    return 'TCP conversation abruptly closed';
  }
};
