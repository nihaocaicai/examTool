import {
  Setting
} from "setting-model.js"

import {
  Storage
} from "../../../../utils/storage.js"

var model = new Setting()

Page({
  onLoad: function() {
    this._initData()
  },

  onReady: function() {
    this.edit = this.selectComponent("#edit") //获得diary组件
  },

  /* 信息设置对话框 */
  /**
   * [事件_显示设置信息]
   */
  showEdit() {
    var info = wx.getStorageSync('user_info')
    var wxInfo = wx.getStorageSync('wx_user_info')
    this.edit.setData({
      nickName: wxInfo['user_name'],
      birthday: info['birthday'],
      examDate: info['examDate'],
      goal_university: info['goal_university'],
      goal_major: info['goal_major'],
      motto: info['motto'],
    })
    this.edit.showEdit()
  },

  _cancel() {
    wx.showModal({
      title: '提示',
      content: '设置取消',
    })
  },

  save_success() {
    wx.showToast({
      title: '设置成功',
    })
    this.onLoad()
  },
  save_fail() {
    wx.showToast({
      title: '设置失败',
    })
  },

  /* 删除信息对话框 */
  /**
   * [事件_删除对话框改变答案框的值]
   */
  bindKeyInput(e) {
    this.setData({
      input: e.detail.value
    })
  },

  /**
   * [事件_删除对话框点击取消按钮]
   */
  cancelDelete() {
    this.setData({
      showDeleteModal: false
    })
  },

  /**
   * [事件_删除对话框点确认按钮]
   */
  confirmDelete(e) {
    var that = this
    if (this.data.result == this.data.input) {
      //回答正确
      wx.showLoading({
        title: '清除数据中',
      })
      model.deleteAccount({
        success: function() {
          var s = new Storage()
          wx.clearStorage()
          wx.hideLoading()
          that.setData({
            showDeleteModal: false
          })
          wx.reLaunch({
            url: '/pages/login/login',
          })
        },
        fail: function() {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '当前无法进行操作，请连接网络后重试',
            showCancel: false,
            confirmText: '知道了',
            confirmColor: '#04838e',
          })
        },
      })
    } else {
      //回答错误
      wx.showToast({
        title: '答案错误',
        image: '/images/fail.png',
        duration: 1200,
      })
    }
  },

  // /**
  //  * [按钮_切换离线模式]
  //  */
  // offlineTipsChange: function(e) {
  //   var that = this
  //   var s = new Storage()
  //   s.save({
  //     key: "hideOfflineTips",
  //     data: !e.detail.value,
  //     success: function() {
  //       that.setData({
  //         hideOfflineTips: !e.detail.value
  //       })
  //     },
  //     showRetry: true,
  //     saveType: "设置",
  //     path: '/pages/menu/menu-content/setting/setting.js',
  //     functionName: 'offlineTipsChange',
  //     retryCancel: function() {
  //       wx.showToast({
  //         title: '设置失败',
  //         image: "/images/fail.png",
  //         duration: 1800,
  //       })
  //     },
  //   })
  // },

  /**
   * [按钮_什么是离线模式]
   */
  whatsOfflineMode: function() {
    wx.showModal({
      title: '什么是离线模式？',
      content: '当手机没有网络或者无法连接到服务器时，软件会进入离线模式。在离线模式下，你只能查看本地已有的今日计划。',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#04838e'
    })
  },

  /**
   * [按钮_点击退出登录]
   */
  clickLogoutButton() {
    var add1 = this._getRandom(1, 9);
    var add2 = this._getRandom(0, 9 - add1);
    this.setData({
      showDeleteModal: true,
      add1: add1,
      add2: add2,
      result: add1 + add2,
      value: '',
    })
  },

  /**
   * [初始化显示的数据]
   */
  _initData() {
    var info = wx.getStorageSync('user_info')
    var wxInfo = wx.getStorageSync('wx_user_info')
    info.birthday = info.birthday == null ? "未设置" : info.birthday
    info.examDate = info.examDate == null ? "未设置" : info.examDate
    info.goal_university = info.goal_university == "" ? "未设置" : info.goal_university
    info.goal_major = info.goal_major == "" ? "未设置" : info.goal_major
    info.motto = info.motto == "" ? "未设置座右铭" : info.motto
    this.setData({
      wxInfo: wxInfo,
      info: info,
      showDeleteModal: false,
      hideOfflineTips: wx.getStorageSync("hideOfflineTips")
    })
  },

  /**
   * [生成随机数]
   */
  _getRandom(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
  },
})