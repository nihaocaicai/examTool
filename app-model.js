/**
 * app 登录模块
 * 只负责获取和处理 userInfo 和 openid
 */
class Login {
  //获取授权操作
  getAuthorize() {
  }

  //告诉 login 需要授权
  needAuthorize() {
    var timeOut = 10;
    var interval = setInterval(function() {
      if (--timeOut != 0) {
        //未授权的回调函数
        try {
          if (app.needAuthorizeCallback && timeOut != 0) {
            clearInterval(interval)
            app.needAuthorizeCallback()
          }
        } catch (e) {
          //捕获回调函数时候的错误
          debug.printErrors("app-model.js", "needAuthorize", "执行回调函数失败", e)
          this.getInfoFail()
        }
      } else {
        //超时还没有准备好回调函数，只能提示获取信息失败
        clearInterval(interval)
        debug.printErrors("app-model.js", "needAuthorize", "回调函数设置失败", "需要授权回调函数设置")
        this.getInfoFail()
      }
    }, 1000)
  }

  

  //微信的 getUserInfo 函数整合
  getUserInfo() {
    wx.getUserInfo({
      lang: "zh_CN",
      success: res => {
        this.processUserInfo(res)
      },
      fail: res => {
        debug.printWxGetUserInfoError("app-model.js", "getUserInfo", res)
        this.getInfoFail()
      }
    })
  }

  //成功获取微信用户信息后对用户信息的操作
  processUserInfo(rawUserInfo) {
    var userInfo = new Object()
    userInfo.user_name = rawUserInfo.userInfo.nickName
    userInfo.user_avatar = rawUserInfo.userInfo.avatarUrl
    userInfo.user_gender = rawUserInfo.userInfo.gender == 1 ? "男" : "女"
    userInfo.user_city = rawUserInfo.userInfo.province + " " + rawUserInfo.userInfo.city

    var token = new Token() //获取 token
    token.successCallBack = function() {
      var storage = new Storage() //添加存储能力
      storage.successCallBack = this.userInfoIsReady
      storage.failCallBack = this.getInfoFail
      storage.setFailInfo('app-model.js', "processUserInfo")
      storage.save('wx_user_info', userInfo)
    }
    token.statusCodeFailCallBack = this.getInfoFail
    token.failCallBack = this.getInfoFail
    token.getTokenFromServer()
  }

  //数据保存成功后，执行回调函数，告诉 login 信息获取成功
  userInfoIsReady() {
    var timeOut = 10;
    var interval = setInterval(function() {
      if (--timeOut != 0) {
        try {
          if (app.userInfoReadyCallback && timeOut != 0) {
            //执行回调函数，告诉 login 信息已经获取完了
            clearInterval(interval)
            app.userInfoReadyCallback()
          }
        } catch (e) {
          //捕获回调函数时候的错误
          debug.printErrors("app-model.js", "userInfoIsReady", "执行回调函数失败", e)
          this.getInfoFail()
        }
      } else {
        //超时还没有准备好回调函数，只能提示获取信息失败
        clearInterval(interval)
        debug.printErrors("app-model.js", "userInfoIsReady", "回调函数设置失败", "UserInfo 数据获取完成回调函数设置失败")
        this.getInfoFail()
      }
    }, 1000)
  }

  //获取信息失败
  getInfoFail() {
    wx.showModal({
      title: '提示',
      content: '获取信息失败。请检查网络连接后，点击确定重启程序重试',
      confirmColor: '#04838e',
      showCancel: false,
      success: function() {
        this.reLunchApp()
      }
    })
  }

  //重启小程序
  reLunchApp() {
    wx.reLaunch({
      url: '/pages/login/login',
    })
    this.getAuthorize()
  }

  //需要在小程序中删除程序
  needDeleteApp() {
  }
};

export {
  Login
};