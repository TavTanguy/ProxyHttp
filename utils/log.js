const { createWriteStream } = require("fs"),
  config = require("../" + (process.env.CONFIG || "./config.json")),
  date = require("./date"),
  { format } = require("util");

const strInfo = createWriteStream(config.log.info, {
  flags: "a"
});

const strError = createWriteStream(config.log.error, {
  flags: "a"
});
strInfo.write(
  `---------- ${
    config.name
  } started the ${date.getTodayDate()} ${date.getNowHour()} ----------\n`
);

function formatStr(data) {
  return `[${date.getNowHour()}] ${format(data)}\n`;
}
function info(data) {
  const str = formatStr(data);
  strInfo.write(str);
  process.stdout.write(str);
}
function error(data) {
  const str = formatStr(data);
  strError.write(str);
  process.stderr.write(str);
}
module.exports = {
  info,
  error
};
