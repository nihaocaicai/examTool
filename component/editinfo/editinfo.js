import {
  DateUtil
} from "../../utils/DateUtil.js"

import {
  EditInfoComponent
} from "editinfo-model.js"

import {
  Storage
} from "../../utils/storage.js"

var dateUtil = new DateUtil()
var model = new EditInfoComponent()

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },

  data: {
    flag: true,
  },

  methods: {
    formSubmit(e) {
      var formData = e.detail.value

      //判断数据填写是否符合要求
      if (formData.birthday != "" && formData.birthday != null && parseInt(dateUtil.countDownDateFromToday(formData.birthday)) >= 0) {
        this._showErrorModel('生日不能设置为今天或未来的日期')
        return
      } else if (formData.examDate != "" && formData.examDate != null && parseInt(dateUtil.countDownDateFromToday(formData.examDate)) < 0) {
        this._showErrorModel('考研日期不能设置为过去的日期')
        return
      }

      if (this.data.isFirstLogin) {
        //第一次登录，不需要检查是否修改
        formData.birthday = formData.birthday == null ? "" : formData.birthday
        formData.examDate = formData.examDate == null ? "" : formData.examDate
        this._saveUserInfo(formData)
      } else {
        //在修改页面，需要检查是否进行过修改
        var isChanged = formData.birthday != this.data.beforeData['birthday'] || formData.examDate != this.data.beforeData['examDate'] || formData.goal_university != this.data.beforeData['goal_university'] || formData.goal_major != this.data.beforeData['goal_major'] || formData.motto != this.data.beforeData['motto']
        if (isChanged) {
          this._modifyUserInfo(formData)
        } else {
          //如果没有修改，等同于点击取消
          this._cancel()
        }
      }
    },

    /**
     * [保存用户信息]
     * 登录页面保存信息时调用
     * 
     * --绑定回调函数--
     * 
     * save_success: 保存成功
     * 
     * save_fail: 保存失败
     */
    _saveUserInfo(formData) {
      var that = this
      var wx_user_info = wx.getStorageSync("wx_user_info")
      wx.showLoading({
        title: '信息保存中',
      })
      model.saveUserInfo({
        data: {
          user_name: wx_user_info['user_name'],
          user_avatar: wx_user_info['user_avatar'],
          user_gender: wx_user_info['user_gender'] == '男' ? 1 : 2,
          user_city: wx_user_info['user_city'],
          user_birthday: formData.birthday,
          user_target: formData.goal_university + "+" + formData.goal_major,
          user_motto: formData.motto,
          user_exam_date: formData.examDate,
        },
        success: function(data) {
          var storage = new Storage()
          storage.saveList({
            saveList: [{
                key: "user_info",
                data: formData,
              },
              {
                key: "hideOfflineTips",
                data: false,
              }
            ],
            success: function() {
              wx.hideLoading()
              that.hideEdit()
              that.triggerEvent("save_success")
            },
            fail: function() {
              wx.hideLoading()
            },
            showRetry: true,
            retry: function() {
              wx.showLoading({
                title: '信息保存中',
              })
            },
            retryCancel: function() {
              that.hideEdit()
              that.triggerEvent("save_fail")
            },
            saveType: "保存信息",
            path: '/component/editinfo/editinfo.js',
            functionName: 'formSubmit',
          })
        },
        statusCodeFail: function() {
          wx.hideLoading()
          that._showErrorModel('服务器出错，请稍后重试')
        },
        fail: function() {
          wx.hideLoading()
          that._showErrorModel('网络连接失败，请检查网络连接是否正确')
        },
      })
    },

    /**
     * [修改用户信息]
     * 修改页面修改信息时调用
     *
     * --绑定回调函数--
     *
     * modify_success: 修改成功，返回保存后的信息
     */
    _modifyUserInfo(formData) {
      var that = this
      var wx_user_info = wx.getStorageSync("wx_user_info")

      wx.showLoading({
        title: '修改信息中',
      })

      model.saveUserInfo({
        data: {
          user_name: wx_user_info['user_name'],
          user_avatar: wx_user_info['user_avatar'],
          user_gender: wx_user_info['user_gender'],
          user_city: wx_user_info['user_city'],
          user_birthday: formData.birthday,
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
              that.triggerEvent("modify_success", formData)
              that.hideEdit()
              wx.hideLoading()
              wx.showToast({
                title: '保存成功',
                icon: 'success',
                duration: 1500,
              })
            },
            fail: function() {
              wx.hideLoading()
              wx.showModal({
                title: '提示',
                content: '失败，可能是存储空间不足，请尝试清理一下手机后再保存',
                showCancel: false,
                confirmText: '好的',
                confirmColor: '#04838e',
              })
            },
          })
        },
        statusCodeFail: function() {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '服务器出错，请稍后重试',
            showCancel: false,
            confirmText: '知道了',
            confirmColor: '#04838e',
          })
        },
        fail: function() {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '当前是离线模式，无法进行操作，请连接网络后重试',
            showCancel: false,
            confirmText: '知道了',
            confirmColor: '#04838e',
          })
        },
      })
    },

    /**
     *[点击取消按钮]
     */
    _cancel() {
      if (!this.data.isFirstLogin) {
        // 修改信息，点击取消直接隐藏对话框
        this.hideEdit()
        this.triggerEvent("cancel")
      }
    },

    /**
     * [展示对话框]
     */
    showEdit() {
      this.setData({
        flag: false
      })
    },

    /**
     * [隐藏对话框]
     */
    hideEdit: function() {
      this.setData({
        flag: true
      })
    },

    /**
     * [事件_修改生日]
     */
    bindBirthdayChange(e) {
      this.setData({
        birthday: e.detail.value
      })
    },

    /**
     * [事件_修改考研日期]
     */
    bindDateChange(e) {
      this.setData({
        examDate: e.detail.value
      })
    },

    /**
     *[显示错误提示]
     */
    _showErrorModel(content) {
      wx.showModal({
        title: '提示',
        content: content,
        showCancel: false,
        confirmColor: "#04838e",
        confirmText: "知道了",
      })
    },

    preventTouchMove: function() {},
  }
})