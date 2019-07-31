const http = require("http"),
  https = require("https"),
  config = require("./config.json"),
  { readFileSync } = require("fs");

const options = {
  key: readFileSync(config.listen.https.key, "utf8"),
  cert: readFileSync(config.listen.https.cert, "utf8")
};
const serverHttp = http.createServer(),
  serverHttps = https.createServer(options);

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
