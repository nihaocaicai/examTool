App({
  globalData: {
    userInfo: {}, //用户信息
    goal: '未填写', //目标，应该在登录时候获取
    motto: '你还没有填写座右铭', //座右铭，应该在登录时候获取
    plan: [], //今日计划
  },

  onLaunch: function(e) {
    var that = this
    //检查版本
    if (wx.canIUse('button.open-type.getUserInfo')) {
      // 版本支持，查看用户是否授权过
      wx.getSetting({
        success: function(res) {
          if (res.authSetting['scope.userInfo']) {
            //授权过，可以直接使用
            wx.getUserInfo({
              lang: "zh_CN",
              success: function(res) {
                that.globalData.userInfo = res.userInfo
                that.getOpenID() //获取用户 openid
                if (that.userInfoReadyCallback) { //回调函数
                  that.userInfoReadyCallback()
                }
              }
            })
          } else {
            //如果未授权，将在 login 页面授权
            if (that.needAuthorizeCallback) { //回调函数
              that.needAuthorizeCallback()
            }
          }
        }
      })
    } else {
      //如果版本太低，则告诉 login 页面版本太低
      that.globalData.userInfo = {
        userInfo: {
          "version_mismatch": true
        }
      }
    }
  },

  // 获取用户 openid
  getOpenID: function(e) {
    console.log("模拟获取用户 openid")
  },
})