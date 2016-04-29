const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Just for CF! ;-)\n');
}).listen(process.env.PORT);
