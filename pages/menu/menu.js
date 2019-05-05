var app = getApp()

Page({
  /*点击 考研计划 按钮 */
  clickPlan: function() {
    wx.navigateTo({
      url: '../menu/menu-content/plan/plan',
    })
  },

  /*点击 考研日记 按钮 */
  clickDiary: function() {
    wx.navigateTo({
      url: '../menu/menu-content/diary/diary',
    })
  },

  /*点击 考研安排 按钮 */
  clickExam: function() {
    wx.navigateTo({
      url: '../menu/menu-content/exam/exam',
    })
  },

  /*点击 设置 按钮 */
  clickSetting: function() {
    wx.navigateTo({
      url: '../menu/menu-content/setting/setting',
    })
  },

  /*点击 错误反馈 按钮 */
  clickFeedback: function() {
    wx.navigateTo({
      url: '../menu/menu-other/feedback/feedback',
    })
  },

  /*点击 联系我们 按钮 */
  clickContact: function() {
    wx.navigateTo({
      url: '../menu/menu-other/contact/contact',
    })
  },

  onShow: function() {
    var wxInfo = wx.getStorageSync("wx_user_info")
    var info = wx.getStorageSync("user_info")

    if (wxInfo != "" && info != "") {
      this.setData({
        motto: info.motto == "" ? "未设置座右铭" : info.motto,
        nickName: wxInfo.user_name,
        avatarUrl: wxInfo.user_avatar,
      })
    }
  },
})