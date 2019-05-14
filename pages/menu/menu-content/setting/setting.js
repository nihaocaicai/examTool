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
    if (!wx.getStorageSync('user_info')){
      this.edit.setData({
        nickName: wxInfo['user_name'],
        birthday: "未设置",
        examDate: "未设置",
        goal_university: "未设置",
        goal_major: "未设置",
        motto: "未设置",
      })
    }else{
      this.edit.setData({
        nickName: wxInfo['user_name'],
        birthday: info['birthday'],
        examDate: info['examDate'],
        goal_university: info['goal_university'],
        goal_major: info['goal_major'],
        motto: info['motto'],
      })
    }
    this.edit.showEdit()
  },

  _cancel() {
    
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

  /**
   * [按钮_什么是离线模式]
   */
  whatsOfflineMode: function() {
    wx.showModal({
      title: '什么是离线状态？',
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
    var wxInfo = wx.getStorageSync('wx_user_info')
    if (!wx.getStorageSync('user_info')) {
      var info={
        birthday: "未设置",
        examDate: "未设置",
        goal_university: "未设置",
        goal_major: "未设置",
        motto: "未设置座右铭",
      }
    } else {
      var info = wx.getStorageSync('user_info')
      info.birthday = info.birthday == null ? "未设置" : info.birthday
      info.examDate = info.examDate == null ? "未设置" : info.examDate
      info.goal_university = info.goal_university == "" ? "未设置" : info.goal_university
      info.goal_major = info.goal_major == "" ? "未设置" : info.goal_major
      info.motto = info.motto == "" ? "未设置座右铭" : info.motto
    }
    var if_has_network = wx.getStorageSync("hideOfflineTips")==true?"否":"是";
    this.setData({
      wxInfo: wxInfo,
      info: info,
      showDeleteModal: false,
      hideOfflineTips: if_has_network
    })
    if (!wx.getStorageSync('plan_if_open_time')) {
      this.setData({
        plan_if_open_time: false,
      })
    }else{
      var plan_if_open_time = wx.getStorageSync("plan_if_open_time")
      this.setData({
        plan_if_open_time: plan_if_open_time,
      })
    }
  },

  /**
   * [生成随机数]
   */
  _getRandom(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
  },

  // 设置是否隐藏首页每日计划缓存
  switchChange(e) {
    wx.setStorageSync("plan_if_open_time", e.detail.value)
  },
})