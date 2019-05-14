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
        wx.showModal({
          title: '提示',
          content: '生日不能设置为今天或未来的日期哦',
        })
        return
      } else if (formData.examDate != "" && formData.examDate != null && parseInt(dateUtil.countDownDateFromToday(formData.examDate)) < 0) {
        wx.showModal({
          title: '提示',
          content: '考研日期不能设置为过去的日期哦',
        })
        return
      } else {
        this._saveUserInfo(formData);
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
      model.saveUserInfo((data) => {
        if(data.error_code=="0"){
          var storage = new Storage()
          storage.saveList({
            saveList: [{
              key: "user_info",
              data: formData,
            }]
          })
          that.hideEdit()
          that.triggerEvent("save_success")
        }else{
          that.triggerEvent("save_fail")
        } 
      }, {
        user_name: wx_user_info['user_name'],
        user_avatar: wx_user_info['user_avatar'],
        user_gender: wx_user_info['user_gender'] == '男' ? 1 : 2,
        user_city: wx_user_info['user_city'],
        user_birthday: formData.birthday == null ? '1900-01-01' : formData.birthday,
        user_target: formData.goal_university + "+" + formData.goal_major,
        user_motto: formData.motto,
        user_exam_date: formData.examDate == null ? '2019-12-22' : formData.examDate,
      })
    },

    /**
     *[点击取消按钮]
     */
    _cancel() {
      this.hideEdit()
      this.triggerEvent("cancel")
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

    preventTouchMove: function() {},
  }
})