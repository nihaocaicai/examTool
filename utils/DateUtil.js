class DateUtil {
  _formatDate(date) {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(
      function formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
      }
    ).join('-')
  }

  _formatTime(time) {
    return [time.getHours(), time.getMinutes()].map(
      function formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
      }
    ).join(':')
  }

  /**
   * 获取下一天的日期
   */
  getNextDate() {
    var date = new Date()
    date.setDate(date.getDate() + 1)
    return this._formatDate(date)
  }

  /**
   * 获取今天的日期
   */
  getFormatDate(type) {
    var date = new Date()
    if (!type) {
      return this._formatDate(date)
    } else if (type == 1) {
      //年
      return date.getFullYear()
    } else if (type == 2) {
      //月
      return date.getMonth() + 1
    } else if (type == 3) {
      //日
      return date.getDate()
    }
  }

  /**
   * 获取现在时刻的时间
   */
  getFormatTime(type) {
    var time = new Date()
    if (!type) {
      return this._formatTime(time)
    } else if (type == 1) {
      //时
      return time.getHours()
    } else if (type == 2) {
      //分
      return time.getMinutes()
    }
  }

  /**
   * 获取首页日期
   */
  getIndexDate() {
    var today = new Date()
    var week = "星期" + "日一二三四五六".charAt(today.getDay());
    return today.getFullYear() + "年" + (today.getMonth() + 1) + "月" + today.getDate() + "日" + ' ' + week.toString()
  }

  /**
   * 从今天开始距离 endDates 还有多少天
   * 
   * @endDates 结束日期, YYYY-MM-DD 形式
   */
  countDownDateFromToday(endDates) {
    var startDate = new Date(Date.parse(this.getFormatDate().replace(/-/g, "/"))).getTime()
    var endDate = new Date(Date.parse(endDates.replace(/-/g, "/"))).getTime()
    var interval_time = -(startDate - endDate) / (1000 * 60 * 60 * 24)
    return interval_time
  }

  /**
   * 从现在时刻开始距离 time 的差值和 timeStamp 比较
   * 
   * @time 准确时间(Date 类型)
   * @timeStap 时间阈值, 单位为毫秒(1s = 1000ms)
   *  
   * @return -1: 小于; 0: 等于; 1:大于
   */
  compareNowTimeStamp(time, timeStamp) {
    var t = time.getTime()
    var n = new Date().getTime()

    if (t - n < timeStamp) {
      return -1
    } else if (t - n == timeStamp) {
      return 0
    } else {
      return 1
    }
  }

  /**
   * [时刻与当前时刻进行比较]
   * 
   * 时刻 xxx 当前时刻 返回 y
   *
   * xxx y
   *
   * 早于: -1
   *
   * 等于: 0
   *
   * 晚于: 1
   *
   * @date 日期, YYYY-MM-DD 形式
   * @time 时间, HH:ss 形式
   */
  compareNow(date, time) {
    var dt = date + " " + time
    var time1 = new Date(dt.replace(/-/g, '/')).getTime()
    var time2 = new Date().getTime()

    if (time1 < time2)
      return -1
    else if (time1 > time2)
      return 1
    else
      return 0
  }

  /**
   * [时间 1 与时间 2 比较]
   * 
   * 时间 1 xxx 时间 2 返回 y
   * 
   * xxx y
   * 
   * 早于: -1
   *
   * 等于: 0
   *
   * 晚于: 1
   *
   * @time1 时间 1, HH:ss 形式
   * @time2 时间 2, HH:ss 形式
   */
  compareTime(time1, time2) {
    var dt1 = this.getFormatDate() + " " + time1
    var dt2 = this.getFormatDate() + " " + time2

    var time1 = new Date(dt1.replace(/-/g, '/')).getTime()
    var time2 = new Date(dt2.replace(/-/g, '/')).getTime()

    if (time1 < time2)
      return -1
    else if (time1 > time2)
      return 1
    else
      return 0
  }

  /**
   * [日期 1 与日期 2 比较]
   * 
   * 日期 1 xxx 日期 2 返回 y
   *
   * xxx y
   *
   * 早于: -1
   *
   * 等于: 0
   *
   * 晚于: 1
   * 
   * @date1 日期 1 的日期, YYYY-MM-DD 形式
   * @time1 日期 1 的时间, HH:ss 形式
   * @date2 日期 2 的日期, YYYY-MM-DD 形式
   * @time2 日期 2 的时间, HH:ss 形式
   */
  compareDateAndTime(date1, time1, date2, time2) {
    var dt1 = date1 + " " + time1
    var dt2 = date2 + " " + time2

    var time1 = new Date(dt1.replace(/-/g, '/')).getTime()
    var time2 = new Date(dt2.replace(/-/g, '/')).getTime()
    if (time1 < time2)
      return -1
    else if (time1 > time2)
      return 1
    else
      return 0
  }

  /**
   * 返回调用时后7天的日期或时间
   * 
   * @type 0:YYYY-MM-DD HH:ss, 1:YYYY-MM-DD, 2:HH(向上取整，例如19:59取19), 3:时间戳,
   */
  getFormatAfterSevenDate(type) {
    //7*24小时的毫秒数为604800000，可以设小一点防止时间上的误差
    var d = new Date(new Date().getTime() + 604800000)
    var date = this._formatDate(d)
    var time = this._formatTime(d)

    if (!type || type == 0) {
      return date + " " + time
    } else if (type == 1) {
      return date
    } else if (type == 2) {
      return time.split(":")[0]
    } else if (type == 3) {
      return d.getTime()
    }
  }

  /**
   * [返回微信提醒的正确日期]
   * 
   * promptDate: 已经设置的提醒日期 YYYY-MM-DD
   */
  getPromptDate(promptDate) {
    var arrange = new Date(promptDate).getTime()
    var sevenDay = this.getFormatAfterSevenDate(3)
    if (arrange < sevenDay) {
      return this._formatDate(new Date(arrange))
    } else {
      return this._formatDate(new Date(sevenDay))
    }
  }

  /**
   * [返回微信提醒的正确时间]
   *
   * promptDate: 已经设置的提醒日期 YYYY-MM-DD
   * 
   * 返回[19, 5]: 从 19 时开始，到 23 时，差值为 (23 - 19) + 1 = 5
   */
  getPromptTime(promptDate) {
    if (promptDate == this.getFormatDate()) {
      // 提醒日期是今天
      // 如果在设置提醒的时候小时是23，则不会让用户选择的
      var nowHours = this.getFormatTime(1) + 1
      return [nowHours, 23 - nowHours + 1]
    } else if (promptDate == this.getFormatAfterSevenDate(1)) {
      // 提醒日期是第7天
      return [0, this.getFormatAfterSevenDate(2) - 0 + 1]
    } else {
      //7天中的任意一天
      return [0, 24]
    }
  }

}

export {
  DateUtil
}