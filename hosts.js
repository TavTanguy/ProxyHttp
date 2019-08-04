const config = require(process.env.CONFIG || "./config.json"),
  { info, error } = require("./utils/log"),
  { get } = require("http");

let hosts = {},
  defaultHost = null;

config.hosts.map(el => {
  if (typeof el.on === "string") {
    el.on = [el.on];
  }
  el.on.map(host => {
    hosts[host] = el.redirect;
  });
  if (el.defaultHost) defaultHost = el.redirect;

  serverRespond(el.redirect.ip, el.redirect.port, respond => {
    if (respond) {
      info(`${el.redirect.name} ✓`);
    } else {
      error(`${el.redirect.name} not respond`);
      info(`${el.redirect.name} ✗`);
    }
  });
});

function getHost(hostname) {
  let host = hosts[hostname];
  if (host == undefined) {
    host = defaultHost;
    if (host == undefined) return null;
  }
  return host;
}
function serverRespond(ip, port, cb) {
  const req = get(
    {
      hostname: ip,
      port
    },
    () => {
      cb(true);
    }
  );
  req.on("error", function(e) {
    cb(false);
  });
}
module.exports = {
  getHost
};
