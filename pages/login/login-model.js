//login 页面登录接口
//完成授权且获取 userInfo 和 openid 之后的操作
var app = getApp()

class Login {
  setPage(page) {
    this.page = page
  }

  //用户点击授权按钮 获取用户信息
  clickAuthorzieButton(e) {
    var userInfo = e.detail.userInfo
    if (userInfo) {
      //用户按了授权按钮
      this.page.setData({
        loading: true, //显示 加载中 页面
        needAuthorize: false, //不显示 点击授权 按钮
      })
      app.processUserInfo(userInfo)
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
      if (!(wx.getStorageSync('user_info') instanceof Object)) {
        //缓存不存在 user_info ，尝试从服务器获取
        that.getUserInfoFromService()
      } else {
        //user_info存在于缓存，获取 plan
        that.getPlanFromService()
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
    //Todo 服务器获取信息
    //success:
    var hasInfo = true //true 表示服务器有信息
    if (hasInfo) {
      // 有信息
      // temp 为模拟获取到的数据
      var temp = {
        "birthday": null,
        "examDate": null,
        "goal_university": "清华大学",
        "goal_major": "软件工程",
        "motto": "座右铭"
      }
      try {
        wx.setStorageSync('user_info', temp)
        //尝试从服务器获取 plan
        that.getPlanFromService()
      } catch (e) {
        //console.log("保存信息出错，错误原因：\n", e)
        app.getInfoFail(e)
      }
    } else {
      //没有信息，一定是没有 plan 的，不需要检查是否存在 plan
      that.showSetUserInfoDialog()
    }

    //fail: 获取不到信息
    /*
    app.getInfoFail("无法从服务器获取 user_Info 信息\n在函数 getUserInfoFromService")
    */
  }

  //从服务器上获取 plan
  getPlanFromService() {
    var that = this
    var plan //要保存的计划

    //Todo 服务器获取信息
    // success:
    // 没有信息
    plan = new Array()
    // 有信息
    //plan = res.data
    //保存数据
    try {
      wx.setStorageSync('plan', plan)
      that.toIndex()
    } catch (e) {
      //console.log("保存信息出错，错误原因：\n", e)
      app.getInfoFail(e)
    }

    //fail:
    /*
      wx.hideLoading()
     */
  }

  //设置对话框 点击确定按钮
  dialogConfirm(formData) {
    wx.showLoading({
      title: '信息保存中',
    })
    try {
      // Todo 执行保存到服务器操作（必须）
      //success: 服务器保存成功
      wx.setStorageSync('user_info', formData)
      wx.setStorageSync('diary', new Array())
      wx.setStorageSync('plan', new Array()) //没有信息，一定是第一次授权或清除过数据/退出登录，即使本地有 plan 也要删除
      this.page.edit.hideEdit();
      wx.hideLoading()
      this.toIndex()

      //fail: 服务器保存失败
      /*
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '保存数据出错，网络连接失败，请检查网络连接是否正确
        showCancel: false,
      })
      */
    } catch (e) {
      //console.log("保存信息出错，错误原因：\n", e)
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '保存数据出错，可能是存储空间不足，请尝试清理一下手机后再保存',
        showCancel: false,
      })
    }
  }

  //填写用户信息对话框
  showSetUserInfoDialog() {
    this.page.edit = this.page.selectComponent("#edit") //获得diary组件
    this.page.edit.setData({
      nickName: wx.getStorageSync("wx_user_info")['user_name']
    })
    this.page.edit.showEdit();
  }

  //跳转到首页
  toIndex() {
    wx.switchTab({
      url: '../index/index',
    })
  }

  //脱机提示
  offlineTips() {
    wx.showModal({
      title: '提示',
      content: '网络连接失败，你只可以查看本地的计划，不能上传到服务器进行保存',
      showCancel: false,
    })
  }
}

export {
  Login
};