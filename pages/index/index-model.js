import {
  Request
} from "../../utils/server/request.js"

import {
  Debug
} from "../../utils/debug.js"

import {
  Storage
} from "../../utils/storage.js"

import {
  Token
} from "../../utils/server/token.js"

var debug = new Debug()
var app = getApp()
var thisClass = this

class Index {
  constructor() {
    thisClass = this
  }

  setPage(page) {
    thisClass.page = page
  }

  /**
   * [从服务器上获取今天的计划 everyday_planList]
   */
  getTodayPlanFromService(callbacks) {
    var r = new Request()
    r.setFailInfo("index-model.js", "getTodayPlanFromService")
    r.request({
      url: '',
      method: '',
      data: {},
      success: callbacks.success,
      statusCodeFail: callbacks.statusCodeFail,
      fail: callbacks.fail,
    })
    r.interface = "getTodayPlan"
    r.successCallBack = function(data) {
      var storage = new Storage()
      storage.successCallBack = thisClass.toIndex //保存成功
      storage.failCallBack = app.getInfoFail //保存失败
      storage.failInfo = failInfo
      storage.save("everyday_planList", data)
    }
    r.statusCodeFailCallBack = thisClass.offlineTips
    r.failCallBack = thisClass.offlineTips
    r.failInfo = failInfo
    r.request()
  }

  //检查每日计划是不是今天的
  checkEveryDayPlan() {
    //检查 everyday_planList 的内容是不是今天的，不是今天的要清除
    var today = new Date()
    var date = [today.getFullYear(), today.getMonth() + 1, today.getDate()].map(
      function formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
      }
    ).join('-')

    if (wx.getStorageSync("everyday_planList") instanceof Object && wx.getStorageSync("everyday_planList").date == date) {} else {
      var everyday_planList = new Object()
      everyday_planList.date = date
      everyday_planList.data = new Array()

      var storage = new Storage()
      storage.successCallBack = thisClass.afterSuccessCheckEveryDayPlan ? thisClass.afterSuccessCheckEveryDayPlan : undefined
      storage.failCallBack = app.getInfoFail
      storage.setFailInfo('login-model.js', "checkEveryDayPlan")
      storage.save("everyday_planList", everyday_planList)
    }
  }

  //脱机提示
  offlineTips() {
    thisClass.afterSuccessCheckEveryDayPlan = function() {
      if (!wx.getStorageSync('hideOfflineTips')) {
        //显示离线提示
        app.globalData.isOffline = true
      }
      thisClass.toIndex()
    }
    thisClass.checkEveryDayPlan()
  }
}

export {
  Index
}