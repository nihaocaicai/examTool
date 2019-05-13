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
var openDebug = true //开启调试功能

Page({
  data: {
    loading: false, //是否要显示 加载中 页面
    needAuthorize: true, //是否需要显示 点击授权 按钮
    loginFailTips: false, //提示加载失败
  },

  onLoad: function() {
    var that=this
    // 判断当前有没有网络，有的话设置不为离线
    wx.getNetworkType({
      success(res) {
        // console.log(res.networkType)
        if (res.networkType != "none") {
          // 设置不为离线模式
          that._setHideOfflineTips(true)
        }else{
          // 设置为离线模式
          that._setHideOfflineTips(false)
        }
      },
      fail(res){
        // console.log(res)
      }
    })
    this._login()
  },

  /**
   * (*内部函数)
   * [加载小程序]
   */
  _login() {
    this._checkStorage();
  },

  /**
   * (*内部函数)
   * [检查缓存]
   * 检查缓存是否有相应的信息
   */
  _checkStorage() {
    var that = this
    // 没有token,直接显示登录界面，有token，直接跳转首页
    if (!(wx.getStorageSync('token'))) {
      return
    } else {
      this._toIndex();
    }
  },

  /**
   * (*内部函数)
   * [监听器]
   * 点击按钮登录，获取token
   */
  _clickAuthorize: function(e) {
    var that = this
    var rawUserInfo = e.detail
    if (rawUserInfo.userInfo) {
      //用户按了授权按钮
      this.setData({
        loading: true, //显示 加载中 页面
        needAuthorize: false, //不显示 点击授权 按钮
      })
      // 用户按了授权按钮，获取token，以及更新本地用户信息
      model.get_token({
        fail: that._loginFail,
      })
      that._processUserInfo(rawUserInfo.userInfo)
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '提示',
        content: '必须授权登录才能使用考研小神器哦～',
        showCancel: false,
      })
      // 显示需要登录的界面
      this.setData({
        loading: false, //显示 加载中 页面
        needAuthorize: ture, //不显示 点击授权 按钮
        loginFailTips: false, //提示登录失败
      })
      // 直接跳转首页，只能看里面是怎么样的，不能使用
      // this._toIndex();
    }
  },

  /**
   * (*内部函数)
   * [成功获取微信用户信息后对用户信息的操作]
   */
  _processUserInfo(userInfo) {
    var that = this
    var storage = new Storage()
    storage.save({
      key: 'wx_user_info',
      data: {
        user_name: userInfo.nickName,
        user_avatar: userInfo.avatarUrl,
        user_gender: userInfo.gender == 1 ? "男" : "女",
        user_city: userInfo.province + " " + userInfo.city,
      },
      saveType: '基本信息',
      success: function() {
        //显示设置用户信息对话框
        that.edit = that.selectComponent("#edit") //获得diary组件
        that.edit.setData({
          nickName: wx.getStorageSync("wx_user_info")['user_name'],
          isFirstLogin: true
        })
        that.edit.showEdit()
      },
      showRretry: true,
      retryCancel: this._saveFail
    })
  },


  /**
   * (*内部函数)
   * [跳转到首页]
   */
  _toIndex() {
    wx.switchTab({
      url: '../index/index',
    })
  },
  _loginFail(){
    this.setData({
      loading: false, //显示 加载中 页面
      needAuthorize: false, //不显示 点击授权 按钮
      loginFailTips: true, //提示登录失败
    })
  },

  _cancel(){
    wx.showModal({
      title: '提示',
      content: '相关信息可以在菜单页的设置菜单那里设置',
    })
    this._toIndex()
  },
  save_success(){
    wx.showToast({
      title: '基本信息设置成功',
    })
    this._toIndex()
  },
  save_fail() {
    wx.showToast({
      title: '基本信息设置失败',
    })
  },
  _saveFail(){
    wx.showToast({
      title: '缓存失败',
    })
  },

  _setHideOfflineTips(data){
    var that = this
    var storage = new Storage()
    storage.save({
      key: 'hideOfflineTips',
      data: data,
      success: function () {
        return
      },
      showRretry: true,
      retryCancel: this._saveFail
    })
  }
})