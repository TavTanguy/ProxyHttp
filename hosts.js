const config = require("./config.json");

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
});

function getHost(hostname) {
  let host = hosts[hostname];
  if (host == undefined) {
    host = defaultHost;
    if (host == undefined) return null;
  }
  return host;
}
module.exports = {
  getHost
};
