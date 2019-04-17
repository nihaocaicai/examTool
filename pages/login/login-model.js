//login 页面登录接口
//完成授权且获取 userInfo 和 openid 之后的操作
var app = getApp()
var testData = require("../../data/testData.js")

class Login {
  //用户点击授权按钮 获取用户信息
  clickAuthorzieButton(page, e) {
    var userInfo = e.detail.userInfo
    if (userInfo) {
      page.setData({
        loading: true, //是否要显示 加载中 页面
        needAuthorize: false, //是否需要授权
      })
      //用户按了授权按钮
      app.gotUserInfo(userInfo)
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
  setCallBack(page) {
    var that = this
    //获取到 userInfo 的回调函数
    app.userInfoReadyCallback = function(isFirst) {
      //isFirst 是否是第一次登录，针对旧版本优化
      if (isFirst) {
        that.setInfo(page)
      } else if (wx.getStorageSync('user_info') == "") {
        //wx.getStorageSync('userInfo') 缓存是否有信息
        //缓存没有信息，可以尝试网络获取，需要这么做吗？
        //不需要直接弹窗让用户重新设置信息
        that.setInfo(page)
      } else {
        that.toIndex()
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
    page.edit.setData({
      nickName: wx.getStorageSync("wx_user_info")['user_name']
    })
    page.edit.showEdit();
  }

  //设置对话框 点击确定按钮
  dialogConfirm(page, formData) {
    //对formData进行处理
    page.edit.hideEdit();
    try {
      wx.setStorageSync('user_info', formData)
      wx.setStorageSync('plan', new Object())
      // Todo 执行保存到服务器操作（必须）
      // Todo 成功后跳转首页，失败提示网络出错
      this.toIndex()
    } catch (e) {
      console.log("保存信息出错", e)
      //存储空间不足够等问题
      wx.showModal({
        title: '提示',
        content: '保存数据出错，可能是存储空间不足，请清理一下手机后重试',
        showCancel: false,
      })
    }
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

  //跳转到首页
  toIndex() {
    wx.switchTab({
      url: '../index/index',
    })
  }
}

export {
  Login
};