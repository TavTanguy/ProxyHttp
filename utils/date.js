module.exports = {
  getTodayDate: function() {
    const date = new Date();
    return `${fill(date.getDate())}/${fill(
      date.getMonth()
    )}/${date.getFullYear()}`;
  },
  getNowHour: function() {
    const date = new Date();
    return `${fill(date.getHours())}:${fill(date.getMinutes())}:${fill(
      date.getSeconds()
    )}`;
  }
};

function fill(str) {
  return ("0" + str).slice(-2);
}
