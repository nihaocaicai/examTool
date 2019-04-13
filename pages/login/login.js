// pages/login/login.js
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasAuth: false,
  },

  /* 点击按钮获取用户信息 监听器 */
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    app.getOpenID() /*获取用户ID*/
    wx.switchTab({
      url: '../index/index',
    })
  },

  /* 用户授权 */
  authorize: function() {
    var that = this
    // 判断用户是否授权
    if (wx.canIUse('button.open-type.getUserInfo')) {
      app.userInfoReadyCallback = res => {
        that.data({
          hasAuth: true,
        })
        //授权，进入主界面
        wx.switchTab({
          url: '../index/index',
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        lang: "zh_CN",
        success: res => {
          app.globalData.userInfo = res.userInfo
          app.getOpenID()
          that.data({
            hasAuth: true,
          })
          //授权，进入主界面
          wx.switchTab({
            url: '../index/index',
          })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.userInfo) {
      this.setData({
        hasAuth: true,
      })
      //授权，进入主界面
      wx.switchTab({
        url: '../index/index',
      })
    }else{
      this.authorize()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})