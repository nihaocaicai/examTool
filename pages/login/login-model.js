import {
  Request
} from "../../utils/server/request.js"

import {
  Debug
} from "../../utils/debug.js"

import {
  Storage
} from "../../utils/storage.js"

const debug = new Debug()
const app = getApp()

/**
 * login 页面登录接口
 * 完成授权且获取 userInfo 和 openid 之后的操作
 */
class Login {
  setPage(page) {
    this.page = page
  }

  //用户点击授权按钮 获取用户信息
  clickAuthorzieButton(e) {
    var rawUserInfo = e.detail
    if (rawUserInfo.userInfo) {
      //用户按了授权按钮
      this.page.setData({
        loading: true, //显示 加载中 页面
        needAuthorize: false, //不显示 点击授权 按钮
      })
      wx.setStorageSync("isFirstLogin", true)
      app.processUserInfo(rawUserInfo)
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '提示',
        content: '必须授权才能使用考研小神器哦～',
        showCancel: false,
      })
    }
  }

  /*初始化回调函数*/
  setCallBack() {
    var that = this
    //获取到 userInfo 的回调函数
    app.userInfoReadyCallback = function() {
      if (wx.getStorageSync("isFirstLogin")) {
        //第一次登录，需要设置信息
        that.showSetUserInfoDialog()
      } else {
        //不是第一次登录
        if (!(wx.getStorageSync('user_info') instanceof Object)) {
          //缓存不存在 user_info，尝试从服务器获取
          that.getUserInfoFromService()
        } else {
          //user_info 存在于缓存，获取 everyday_planList
          that.getTodayPlanFromService()
        }
      }
    }
    //未授权的回调函数
    app.needAuthorizeCallback = function() {
      that.page.setData({
        needAuthorize: true, //显示 点击授权 按钮
        loading: false, //不显示 加载中 页面
      })
    }
    //需要删除小程序提示
    app.needDeleteAppCallback = function() {
      that.page.setData({
        needAuthorize: false,
        loading: false,
        needDelete: true, //需要删除小程序提示
      })
    }
  }

  //从服务器获取 user_info
  getUserInfoFromService() {
    var that = this
    var failInfo = {
      path: 'login-model.js',
      functionName: "getUserInfoFromService"
    }
    var r = new Request()
    r.interface = "getInfo"
    r.successCallBack = function() {
      //服务器与本地数据代码格式不相同，需要转义
      var target = res.data['user_target'].split("+")
      var user_info = new Object()
      user_info['birthday'] = res.data['user_birthday']
      user_info['examDate'] = res.data['user_exam_date']
      user_info['goal_university'] = target[0]
      user_info['goal_major'] = target[1]
      user_info['motto'] = res.data['user_motto']
      var storage = new Storage()
      storage.setSuccessCallBack(that.getTodayPlanFromService) //保存成功
      storage.setFailCallBack(app.getInfoFail) //保存失败
      storage.failInfo = failInfo
      storage.save("user_info", user_info)
    }
    r.statusCodeFailCallBack = app.getInfoFail
    r.failCallBack = app.getInfoFail
    r.failInfo = failInfo
    r.request()
  }

  //从服务器上获取今天的计划 everyday_planList
  getTodayPlanFromService() {
    var that = this
    var failInfo = {
      path: 'login-model.js',
      functionName: "getTodayPlanFromService"
    }
    var r = new Request()
    r.interface = "getTodayPlan"
    r.successCallBack = function(res) {
      var storage = new Storage()
      storage.setSuccessCallBack(that.toIndex) //保存成功
      storage.setFailCallBack(app.getInfoFail) //保存失败
      storage.failInfo = failInfo
      storage.save("everyday_planList", res.data)
    }
    r.statusCodeFailCallBack = that.offlineTips
    r.failCallBack = that.offlineTips
    r.failInfo = failInfo
    r.request()
  }

  //设置对话框 点击确定按钮
  dialogConfirm(formData) {
    var that = this
    var failInfo = {
      path: 'login-model.js',
      functionName: "dialogConfirm"
    }
    that.wx_user_info = that.wx_user_info ? wx.getStorageSync("wx_user_info") : that.wx_user_info
    wx.showLoading({
      title: '信息保存中',
    })

    var r = new Request()
    r.interface = "modifyInfo"
    r.data = {
      user_name: wx_user_info['user_name'],
      user_avatar: wx_user_info['user_avatar'],
      user_gender: wx_user_info['user_gender'],
      user_city: wx_user_info['user_city'],
      user_brithday: formData.birthday,
      user_target: formData.goal_university + "+" + formData.goal_major,
      user_motto: formData.motto,
      user_exam_date: formData.examDate,
    }
    r.successCallBack = function() {
      that.wx_user_info = that.wx_user_info ? wx.getStorageSync("wx_user_info") : that.wx_user_info
      wx.clearStorageSync() //清除所有信息
      var storage = new Storage()
      var saveList = new Array()
      saveList.push({
        key: "wx_user_info",
        data: that.wx_user_info,
      })
      saveList.push({
        key: "user_info",
        data: formData,
      })
      saveList.push({
        key: "hideOfflineTips",
        data: false,
      })
      storage.setSaveType("保存信息")
      storage.setSaveList(saveList)
      storage.setSuccessCallBack = function() {
        
        //写法错误！！应该是success = function(), 而不是set... = function()!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        
        that.page.edit.hideEdit();
        wx.hideLoading()
        that.afterSuccessCheckEveryDayPlan = that.toIndex
        that.checkEveryDayPlan()
      }
      storage.retryCallBack = function() {
        storage.saveList()
      }
      storage.failInfo = failInfo
      storage.saveList()
    }
    r.statusCodeFailCallBack = function() {
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '服务器出错，请稍后重试',
        showCancel: false,
      })
    }
    r.failCallBack = function() {
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '网络连接失败，请检查网络连接是否正确',
        showCancel: false,
      })
    }
    r.failInfo = failInfo
    r.request()
  }

  //填写用户信息对话框
  showSetUserInfoDialog() {
    this.page.edit = this.page.selectComponent("#edit") //获得diary组件
    this.page.edit.setData({
      nickName: wx.getStorageSync("wx_user_info")['user_name'],
      isFirstLogin: true
    })
    this.page.edit.showEdit();
  }

  //跳转到首页
  toIndex() {
    wx.switchTab({
      url: '../index/index',
    })
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
      storage.setSuccessCallBack = this.afterSuccessCheckEveryDayPlan ? this.afterSuccessCheckEveryDayPlan : undefined
      storage.setFailCallBack = app.getInfoFail
      storage.setFailInfo('login-model.js', "checkEveryDayPlan")
      storage.save("everyday_planList", everyday_planList)
    }
  }

  //脱机提示
  offlineTips() {
    var that = this
    this.afterSuccessCheckEveryDayPlan = function() {
      if (!wx.getStorageSync('hideOfflineTips')) {
        //显示离线提示
        app.globalData.isOffline = true
      }
      that.toIndex()
    }
    that.checkEveryDayPlan()
  }
}

export {
  Login
};