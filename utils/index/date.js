//获取今天的日期
function getDate() {
  var date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const week = "星期" + "日一二三四五六".charAt(date.getDay());
  return [year, month, day].map(
    function formatNumber(n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    }
  ).join('-') + ' ' + week.toString()
}

module.exports = {
  date: getDate(), //今天的日期
}