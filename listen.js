#!/usr/bin/env node
const http = require("http"),
  https = require("https"),
  config = require("./config.json"),
  hosts = require("./hosts"),
  { info, error } = require("./utils/log"),
  { readFileSync, createReadStream } = require("fs");

const optionsHttps = {
  key: readFileSync(config.listen.https.key, "utf8"),
  cert: readFileSync(config.listen.https.cert, "utf8")
};
const serverHttp = http.createServer(),
  serverHttps = https.createServer(optionsHttps);

serverHttp.on("request", onRequest);
serverHttps.on("request", onRequest);

serverHttp.listen(config.listen.http.port, config.listen.ip, () => {
  info(
    `${config.name} listen on ${config.listen.ip}:${config.listen.http.port}`
  );
});
serverHttps.listen(config.listen.https.port, config.listen.ip, () => {
  info(
    `${config.name} secure listen on ${config.listen.ip}:${
      config.listen.https.port
    }`
  );
});

function onRequest(req, res) {
  try {
    req.headers.encrypted =
      req.connection.encrypted == undefined ? false : true;
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
    reqProxy.on("error", err => {
      notRespond(req, res, host);
    });
    req.on("end", () => {
      info(`{${req.connection.remoteAddress}} rediect to ${host.name}`);
    });
    req.pipe(reqProxy);
  } catch (err) {
    error(err);
    res.writeHead(
      config.responds.onError.code,
      Object.assign(
        config.responds.ifNotRespond.headers,
        config.responds.headers
      )
    );
    createReadStream(config.responds.onError.file).pipe(res);
    error(`{${req.connection.remoteAddress}} respond with error`);
  }
}

function noHost(req, res) {
  res.writeHead(
    config.responds.ifNoHost.code,
    Object.assign(config.responds.ifNotRespond.headers, config.responds.headers)
  );
  createReadStream(config.responds.ifNoHost.file).pipe(res);
  error(`{${req.connection.remoteAddress}} no host`);
}
function notRespond(req, res, host) {
  if (host.ifNotRepond) {
    res.writeHead(
      host.ifNotRepond.code,
      Object.assign(host.ifNotRepond.headers, config.responds.headers)
    );
    createReadStream(host.ifNotRepond.file).pipe(res);
  } else {
    res.writeHead(
      config.responds.ifNotRespond.code,
      Object.assign(
        config.responds.ifNotRespond.headers,
        config.responds.headers
      )
    );
    createReadStream(config.responds.ifNotRespond.file).pipe(res);
  }
  error(`{${req.connection.remoteAddress}} host ${host.name} not respond`);
}

process.title = config.name;
process.setUncaughtExceptionCaptureCallback(error);
