class DateUtil {
  getFormatDate(){
    var today = new Date()
    return [today.getFullYear(), today.getMonth() + 1, today.getDate()].map(
      function formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
      }
    ).join('-')
  }

  //首页日期
  getIndexDate() {
    var today = new Date()
    const week = "星期" + "日一二三四五六".charAt(today.getDay());
    return (this.getFormatDate()).toString() + ' ' + week.toString()
  }

  //从今天开始还有多少天
  countDownFromToday(endDates) {
    var startDate = new Date().getTime()
    var endDate = new Date(Date.parse(endDates.replace(/-/g, "/"))).getTime()
    var interval_time = -(startDate - endDate) / (1000 * 60 * 60 * 24)
    return interval_time
  }
};

export {
  DateUtil
};