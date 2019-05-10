import {
  DateUtil
} from "../../../utils/DateUtil.js"
var dateUtil = new DateUtil()

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
      //没有问题
      if (this.data.isModify) {
        // 修改计划
        var beforeData = this.data.beforeData
        var flag = beforeData.plan_content != this.data.plan_content ||
          beforeData.plan_date != this.data.plan_date ||
          beforeData.plan_start_time != this.data.plan_start_time ||
          beforeData.plan_end_time != this.data.plan_end_time ||
          beforeData.plan_id != this.data.plan_id ||
          beforeData.plan_if_finish != this.data.plan_if_finish ? 1 : 0 ||
          beforeData.plan_if_repeat != this.data.plan_if_repeat

        if (flag) {
          formData.plan_id = this.data.plan_id
          formData.plan_if_finish = this.data.plan_if_finish
          formData.plan_if_repeat = this.data.plan_if_repeat ? 1 : 0
          this.triggerEvent("confirm_modify", formData)
        } else {
          this._cancel()
        }
      } else {
        // 添加计划，检查各项内容是否填写正确
        var tips = ""
        if (formData.plan_content == "") {
          tips = "计划"
        } else if (formData.plan_date == null) {
          tips = "日期"
        } else if (formData.plan_start_time == null) {
          tips = "开始时间"
        } else if (formData.plan_end_time == null) {
          tips = "结束时间"
        } else if (dateUtil.isEarlyFromTime(this.data.plan_end_time, this.data.plan_start_time) != 1) {
          wx.showModal({
            title: '提示',
            content: '结束时间不能早于或等于开始时间哦！',
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
        formData.plan_if_finish = 0
        formData.plan_if_repeat = this.data.plan_if_repeat ? 1 : 0
        this.triggerEvent("confirm_add", formData)
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
      this.setData({
        flag: true
      })
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

    //蒙层点击事件
    preventTouchMove() {},
  }
})