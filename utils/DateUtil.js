class DateUtil {
  //今天的日期
  getFormatDate() {
    var today = new Date()
    return [today.getFullYear(), today.getMonth() + 1, today.getDate()].map(
      function formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
      }
    ).join('-')
  }

  //获取时刻的时间
  getFormatTime() {
    var today = new Date()
    return [today.getHours(), today.getMinutes()].map(
      function formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
      }
    ).join(':')
  }

  //首页日期
  getIndexDate() {
    var today = new Date()
    const week = "星期" + "日一二三四五六".charAt(today.getDay());
    return today.getFullYear() + "年" + (today.getMonth() + 1) + "月" + today.getDate() + "日" + ' ' + week.toString()
  }

  //从今天开始还有多少天
  countDownFromToday(endDates) {
    var startDate = new Date(Date.parse(this.getFormatDate().replace(/-/g, "/"))).getTime()
    var endDate = new Date(Date.parse(endDates.replace(/-/g, "/"))).getTime()
    var interval_time = -(startDate - endDate) / (1000 * 60 * 60 * 24)
    return interval_time
  }

  //日期早于现在吗？
  isEarlyFromNow(date, time) {
    var time1 = new Date(date + " " + time).getTime()
    var time2 = new Date().getTime()
    return time1 < time2
  }

  //日期1晚于日期2吗？
  isLateFromDate(date1, time1, date2, time2) {
    return !this.isEarlyFromDate(date1, time1, date2, time2)
  }

  //日期1早于日期2吗？
  isEarlyFromDate(date1, time1, date2, time2) {
    var time1 = new Date(date1 + " " + time1).getTime()
    var time2 = new Date(date2 + " " + time2).getTime()
    return time1 < time2
  }

  //时间1早于时间2吗？
  isEarlyFromTime(time1, time2) {
    var time1 = new Date(this.getFormatDate() + " " + time1).getTime()
    var time2 = new Date(this.getFormatDate() + " " + time2).getTime()
    return time1 < time2
  }
};

export {
  DateUtil
};