const http = require("http"),
  https = require("https"),
  config = require("./config.json"),
  hosts = require("./hosts"),
  { readFileSync, createReadStream } = require("fs"),
  { join } = require("path");

const optionsHttps = {
  key: readFileSync(config.listen.https.key, "utf8"),
  cert: readFileSync(config.listen.https.cert, "utf8")
};
const serverHttp = http.createServer(),
  serverHttps = https.createServer(optionsHttps);

serverHttp.on("request", onRequest);
serverHttps.on("request", onRequest);

serverHttp.listen(config.listen.http.port, config.listen.ip, () => {
  console.log(
    `${config.name} listen on ${config.listen.ip}:${config.listen.http.port}`
  );
});
serverHttps.listen(config.listen.https.port, config.listen.ip, () => {
  console.log(
    `${config.name} secure listen on ${config.listen.ip}:${
      config.listen.https.port
    }`
  );
});

function onRequest(req, res) {
  req.headers.encrypted = req.connection.encrypted == undefined ? false : true;
  const host = hosts.getHost(req.headers.host);
  if (host == null) {
    return noHost(req, res);
  }
  const options = {
    hostname: host.ip,
    port: host.port,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  const reqProxy = http.request(options, resProxy => {
    res.writeHead(resProxy.statusCode, resProxy.headers);
    resProxy.pipe(res);
  });
  req.pipe(reqProxy);
}

function noHost(req, res) {
  res.writeHead(config.ifNoHost.code, config.ifNoHost.headers);
  createReadStream(config.ifNoHost.file).pipe(res);
}
