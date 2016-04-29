var fs = require('fs'),
  path = require('path'),
  parser = require('gitignore-parser'),
  archiver = require('archiver'),
  filewalker = require('filewalker');

module.exports = (appSource, zipTarget, callback) => {
  var output = fs.createWriteStream(zipTarget);

  var archive = archiver('zip');

  fs.access(path.join(appSource, '.cfignore'), fs.R_OK, (err) => {
    var cfignore = null;
    if (!err) {
      cfignore = parser.compile(fs.readFileSync(path.join(appSource, '.cfignore'), 'utf8'));
    }

    filewalker(appSource)
      .on('file', (p, s) => {
        if (p === '.cfignore') return;
        if (!cfignore || cfignore.accepts(p)) {
          var stat = fs.statSync(path.join(appSource, p));
          archive.append(fs.createReadStream(path.join(appSource, p)), { name: p, mode: stat.mode });
        }
      })
      .on('error', (err) => {
        callback(err);
      })
      .on('done', () => {
        archive.pipe(output);
        archive.finalize();

        output.on('close', () => {
          callback(null);
        });
      })
    .walk();
  });
};
