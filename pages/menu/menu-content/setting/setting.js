import {
  SettingComponent
} from "setting-model.js"

import {
  Storage
} from "../../../../utils/storage.js"

var model = new SettingComponent()

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
    if (!this.isShow) {
      this.isShow = true
      var info = wx.getStorageSync('user_info')
      var wxInfo = wx.getStorageSync('wx_user_info')
      this.edit.setData({
        isFirstLogin: false, //不是在登录的时候显示对话框
        nickName: wxInfo['user_name'],
        birthday: info['birthday'],
        examDate: info['examDate'],
        goal_university: info['goal_university'],
        goal_major: info['goal_major'],
        motto: info['motto'],
        beforeData: info, //修改前的数据，用于检查是否修改过
      })
      this.edit.showEdit();
    }
  },

  /**
   * [事件_设置信息取消按钮]
   */
  _error() {
    this.isShow = false
    this.edit.hideEdit();
  },

  /**
   * [事件_设置信息保存按钮]
   */
  _save(e) {
    var that = this
    var formData = e.detail
    var wx_user_info = wx.getStorageSync("wx_user_info")

    wx.showLoading({
      title: '保存信息中',
    })
    model.saveUserInfo({
      data: {
        token: wx_user_info['token'],
        user_name: wx_user_info['user_name'],
        user_avatar: wx_user_info['user_avatar'],
        user_gender: wx_user_info['user_gender'],
        user_city: wx_user_info['user_city'],
        user_brithday: formData.birthday,
        user_target: formData.goal_university + "+" + formData.goal_major,
        user_motto: formData.motto,
        user_exam_date: formData.examDate,
      },
      success: function() {
        var s = new Storage()
        s.save({
          key: 'user_info',
          data: formData,
          success: function() {
            that.setData({
              info: formData,
            })
            that.edit.hideEdit()
            that.isShow = false
            wx.hideLoading()
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 1500,
            })
          },
          fail: function() {
            wx.hideLoading()
            that._errorSave('保存信息')
          },
        })
      },
      statusCodeFail: function() {
        wx.hideLoading()
        that._errorServer()
      },
      fail: function() {
        wx.hideLoading()
        that._errorConnect()
      },
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
          s.save({
            key: 'logout',
            data: true,
            success: function() {
              wx.hideLoading()
              this.setData({
                showDeleteModal: false
              })
              wx.showModal({
                title: '提示',
                content: '退出成功，请在微信中删除小程序完成退出操作',
                showCancel: false,
                confirmColor: '#04838e',
                success: function(res) {
                  wx.reLaunch({
                    url: '/pages/login/login',
                  })
                },
              })
            },
            fail: function() {
              //如果没办法删除，可能是没有存储空间设置标签，清除存储空间后重试
              wx.hideLoading()
              that._errorSave('退出')
            },
          })
        },
        fail: function() {
          wx.hideLoading()
          that._errorConnect()
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
   * [按钮_切换离线模式]
   */
  offlineTipsChange: function(e) {
    var that = this
    var s = new Storage()
    s.save({
      key: "hideOfflineTips",
      data: !e.detail.value,
      success: function() {
        that.setData({
          hideOfflineTips: !e.detail.value
        })
      },
      showRetry: true,
      saveType: "设置",
      path: '/pages/menu/menu-content/setting/setting.js',
      functionName: 'offlineTipsChange',
      retryCancel: function() {
        wx.showToast({
          title: '设置失败',
          image: "/images/fail.png",
          duration: 1800,
        })
      },
    })
  },

  /**
   * [按钮_什么是离线模式]
   */
  whatsOfflineMode: function() {
    wx.showModal({
      title: '什么是离线模式？',
      content: '当手机没有网络或者无法连接到服务器时，软件会进入离线模式。在离线模式下，你只能查看本地已有的计划、日记和信息，不能进行添加、删除和修改操作。',
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
   * [服务器返回错误代码]
   */
  _errorServer() {
    wx.showModal({
      title: '提示',
      content: '服务器出错，请稍后重试',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#04838e',
    })
  },

  /**
   * [服务器连接失败]
   */
  _errorConnect() {
    wx.showModal({
      title: '提示',
      content: '当前是离线模式，无法进行操作，请连接网络后重试',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#04838e',
    })
  },

  /**
   * [数据保存失败]
   * 
   * @type XX 出错
   */
  _errorSave(type) {
    wx.showModal({
      title: '提示',
      content: '失败，可能是存储空间不足，请尝试清理一下手机后再保存',
      showCancel: false,
      confirmText: '好的',
      confirmColor: '#04838e',
    })
  },

  /**
   * [生成随机数]
   */
  _getRandom(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
  },
})