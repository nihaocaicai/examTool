import {
  DateUtil
} from "../../../utils/DateUtil.js"

import {
  EditPlanComponent
} from "editplan-model.js"

var dateUtil = new DateUtil()
var model = new EditPlanComponent()

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },

  data: {
    flag: true,
    hidden_time: true,
  },

  methods: {
    /**
     * [事件_组件表单提交数据]
     */
    formSubmit(e) {
      var formData = e.detail.value
      // 操作前先检查填写的数据是否正确
      var tips = ""
      if (formData.plan_content == "") {
        tips = "计划"
      } else if (formData.plan_date == null || formData.plan_date=="") {
        tips = "日期"
      } else if (formData.plan_start_time == null || formData.plan_start_time == "") {
        tips = "开始时间"
      }else if (dateUtil.compareNow(formData.plan_date, formData.plan_start_time) == -1) {
        wx.showModal({
          title: '提示',
          content: '开始时间不能早于或等于现在的时间哦！',
          showCancel: false,
          confirmColor: "#04838e",
          confirmText: "知道了",
        })
        return
      }
      if (tips != "") {
        //存在问题
        wx.showModal({
          title: '提示',
          content: '你忘了填写' + tips + "哦！",
          showCancel: false,
          confirmColor: "#04838e",
          confirmText: "知道了",
        })
        return
      }

      if (this.data.isModify) {
        // 修改计划
        var beforeData = this.data.beforeData

        var flag = beforeData.plan_content != formData.plan_content ||
          beforeData.plan_date != formData.plan_date ||
          beforeData.plan_start_time != formData.plan_start_time ||
          beforeData.plan_end_time != formData.plan_end_time ||
          beforeData.plan_if_repeat != formData.plan_if_repeat

        if (flag) {
          formData.plan_id = this.data.plan_id
          formData.plan_if_finish = this.data.plan_if_finish
          formData.plan_if_repeat = (this.data.plan_if_repeat ? 1 : 0)
          this.modifyPlan(formData)
        } else {
          this._cancel()
        }
      } else {
        formData.plan_if_finish = 0
        formData.plan_if_repeat = (this.data.plan_if_repeat ? 1 : 0)
        this.addPlan(formData)
      }
    },

    /**
     * [隐藏弹框]
     */
    hideEdit: function() {
      this.setData({
        flag: true
      })
    },

    /**
     * [展示弹框]
     */
    showEdit: function() {
      this.setData({
        flag: false
      })
    },

    /**
     * [事件_点击取消按钮]
     */
    _cancel() {
      this.hideEdit()
      this.triggerEvent("cancel")
    },

    /**
     * [事件_日期改变]
     */
    bindDateChange(e) {
      this.setData({
        plan_date: e.detail.value
      })
    },

    /**
     * [事件_开始时间改变]
     */
    bindStarTimeChange(e) {
      this.setData({
        plan_start_time: e.detail.value
      })
    },

    /**
     * [事件_结束时间改变]
     */
    bindEndTimeChange(e) {
      this.setData({
        plan_end_time: e.detail.value
      })
    },

    /**
     * [事件_是否重复改变]
     */
    repeatChange(e) {
      this.setData({
        plan_if_repeat: e.detail.value
      })
    },

    /**
     * [添加计划]
     * 
     * 回调函数:
     * 
     * add_success: 添加成功
     * 
     * add_fail: 添加失败
     */
    addPlan(formData) {
      var that = this
      wx.showLoading({
        title: '添加中',
      })
      model.addPlan({
        data: formData,
        success: function() {
          wx.hideLoading()
          that.hideEdit()
          that.triggerEvent("add_success")
        },
        fail: function() {
          wx.hideLoading()
          wx.showToast({
            title: '添加失败',
            image: '/images/fail.png',
            duration: 1800,
          })
          that.triggerEvent("add_fail")
        }
      })
    },

    /**
     * [修改计划]
     * 
     * 回调函数:
     * 
     * modify_success: 添加成功
     * 
     * modify_fail: 添加失败
     */
    modifyPlan: function(formData) {
      var that = this
      wx.showLoading({
        title: '修改中',
      })
      model.addPlan({
        data: formData,
        success: function() {
          wx.hideLoading()
          that.hideEdit()
          that.triggerEvent("modify_success")
        },
        fail: function() {
          wx.hideLoading()
          wx.showToast({
            title: '修改失败',
            image: '/images/fail.png',
            duration: 1800,
          })
          that.triggerEvent("modify_fail")
        }
      })
    },

    preventTouchMove() {},
  }
})