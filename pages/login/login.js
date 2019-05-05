import {
  Login
} from "login-model.js"

import {
  Storage
} from "../../utils/storage.js"

import {
  Debug
} from "../../utils/debug.js"

var model = new Login()
var debug = new Debug()
var openDebug = true

Page({
  data: {
    loading: true, //是否要显示 加载中 页面
    needAuthorize: false, //是否需要显示 点击授权 按钮
    needDelete: false, //需要删除小程序提示
  },

  onShow: function() {
    model.setPage(this)
    this.login() //获得授权

    //调试用，用完删除
    /*
    setTimeout(function () {
      wx.navigateTo({
        url: '../menu/menu-content/exam/exam',
      })
    }, 1000)
    */
  },

  /**
   * [加载小程序]
   */
  _load() {
    var that = this
    if (wx.getStorageSync('logout')) {
      /* 执行过登出操作，提示需要删除小程序后再添加 */
      this.setData({
        needAuthorize: false,
        loading: false,
        needDelete: true, //需要删除小程序提示
      })
    } else if (wx.getStorageSync('wx_user_info') != "") {
      //如果缓存有数据，检查基本信息是否更改了
      model.checkForChanges()
    } else {
      // 如果缓存没有数据，重新获取数据
      if (wx.canIUse('button.open-type.getUserInfo')) {
        wx.getSetting({
          // 微信新版本，查看用户是否授权过
          success: function(res) {
            if (res.authSetting['scope.userInfo']) {
              /* 授权过，获取用户信息 */
              model.getUserInfo()
            } else {
              /* 没有授权，需要用户点击按钮授权 */
              that.setData({
                needAuthorize: true,
                loading: false,
              })
            }
          },
          fail: function(res) {
            openDebug && debug.printErrors("app-model.js", "getAuthorize", "获取用户设置 (wx.getSetting) 错误", res)
            that.getInfoFail()
          }
        })
      } else {
        //微信旧版本，在没有 open-type=getUserInfo 版本的兼容处理
        model.getUserInfo()
      }
    }
  },

  /* 点击按钮获取用户信息 监听器 */
  clickAuthorzieButton: function(e) {
    var rawUserInfo = e.detail
    if (rawUserInfo.userInfo) {
      //用户按了授权按钮
      this.setData({
        loading: true, //显示 加载中 页面
        needAuthorize: false, //不显示 点击授权 按钮
      })
      var storage = new Storage()
      storage.save({
        key: 'isFirstLogin',
        data: true,
      })
      app.processUserInfo(rawUserInfo)
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '提示',
        content: '必须授权才能使用考研小神器哦～',
        showCancel: false,
      })
    }
  },

  //回调 保存数据事件
  _save(e) {
    var formData = e.detail
    var failInfo = {
      path: 'login-model.js',
      functionName: "dialogConfirm"
    }
    thisClass.wx_user_info = wx.getStorageSync("wx_user_info") ? wx.getStorageSync("wx_user_info") : thisClass.wx_user_info
    wx.showLoading({
      title: '信息保存中',
    })

    var r = new Request()
    r.interface = "modifyInfo"
    r.data = {
      user_name: thisClass.wx_user_info['user_name'],
      user_avatar: thisClass.wx_user_info['user_avatar'],
      user_gender: thisClass.wx_user_info['user_gender'],
      user_city: thisClass.wx_user_info['user_city'],
      user_brithday: formData.birthday,
      user_target: formData.goal_university + "+" + formData.goal_major,
      user_motto: formData.motto,
      user_exam_date: formData.examDate,
    }
    r.successCallBack = function(data) {
      thisClass.wx_user_info = wx.getStorageSync("wx_user_info") ? wx.getStorageSync("wx_user_info") : thisClass.wx_user_info
      wx.clearStorageSync() //清除所有信息
      var storage = new Storage()
      var saveList = new Array()
      saveList.push({
        key: "wx_user_info",
        data: thisClass.wx_user_info,
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
      storage.successCallBack = function() {
        thisClass.page.edit.hideEdit();
        wx.hideLoading()
        thisClass.afterSuccessCheckEveryDayPlan = thisClass.toIndex
        thisClass.checkEveryDayPlan()
      }
      storage.retryCallBack = storage.saveList
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
  },

  _userInfoReadyCallback() {
    if (wx.getStorageSync("isFirstLogin")) {
      //第一次登录，需要设置信息
      thisClass.showSetUserInfoDialog()
    } else {
      //不是第一次登录
      if (!(wx.getStorageSync('user_info') instanceof Object)) {
        //缓存不存在 user_info，尝试从服务器获取
        thisClass.getUserInfoFromService()
      } else {
        //user_info 存在于缓存，获取 everyday_planList
        thisClass.getTodayPlanFromService()
      }
    }
  }
})