//login 页面登录接口
//完成授权且获取 userInfo 和 openid 之后的操作
var app = getApp()
var testData = require("../../data/testData.js")

class Login {
  //用户点击授权按钮 获取用户信息
  clickAuthorzieButton(page, e) {
    var userInfo = e.detail.userInfo
    if (userInfo) {
      //用户按了授权按钮
      app.gotUserInfo(userInfo)
      app.getOpenID()
      this.setInfo(page)
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '提示',
        content: '必须授权才能使用考研小神器哦～',
        showCancel: false,
      })
    }
  }

  //设置回调函数
  setCallBack(page) {
    var that = this
    /*初始化回调函数*/
    //已获取用户信息的回调函数
    app.userInfoReadyCallback = function(isFirst) {
      //isFirst 是否是第一次登录，针对旧版本优化
      if (isFirst || wx.getStorageSync('hasInfo') == false) {
        that.setInfo(page)
      } else {
        that.getInfo(page)
      }
    }
    //未授权的回调函数
    app.needAuthorizeCallback = function() {
      page.setData({
        needAuthorize: true, //显示 授权 页面
        loading: false, //不显示 加载中 页面
      })
    }
  }

  //第一次登录，需要填写用户信息
  //只要是第一次授权，就是第一次登录
  // page 指的是 login 页面
  setInfo(page) {
    page.edit = page.selectComponent("#edit") //获得diary组件
    try {
      wx.setStorageSync('hasInfo', false)
    } catch (e) {}
    page.edit.showEdit();
  }

  //设置对话框 点击确定按钮
  // page 指的是 login 页面
  dialogConfirm(page) {
    console.log("设置成功")
    page.edit.hideEdit();
    try {
      wx.setStorageSync('hasInfo', true)
    } catch (e) {}
    wx.switchTab({
      url: '../index/index',
    })
  }

  //设置对话框 点击取消按钮
  // page 指的是 login 页面
  dialogCancel(page) {
    wx.showModal({
      title: '提示',
      content: '必须设置信息才能使用哦～',
      showCancel: false,
    })
  }

  // 获取用户基本信息(例如目标大学，座右铭等)
  // page 指的是 login 页面
  getInfo(page) {
    //获取计划等信息（应该由网络获取
    //如果获取信息成功，则
    app.globalData.plan = testData.index_plan
    //在获取完之后才进入主界面，否则弹出对话框，提示网络错误(例如"网络连接超时")
    wx.switchTab({
      url: '../index/index',
    })
  }
};

export {
  Login
};