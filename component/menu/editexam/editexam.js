import {
  DateUtil
} from "../../../utils/DateUtil.js"
var dateUtil = new DateUtil()

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },

  /**
   * 组件的属性列表
   */
  properties: {
    title: { // 属性名
      type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '标题' // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    // 弹窗内容
    content: {
      type: String,
      value: '内容'
    },
    // 弹窗取消按钮文字
    btn_no: {
      type: String,
      value: '取消'
    },
    // 弹窗确认按钮文字
    btn_ok: {
      type: String,
      value: '保存'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    flag: true,
    arrange_if_prompt: false,
    promptTimeSelect: [
      ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15 ', '16', '17', '18', '19', '20', '21', '22', '23'],
      ['00']
    ], //提醒时间选择器
    promptTimeSelectIndex: [0, 0],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    formSubmit(e) {
      var formData = e.detail.value

      if (this.data.arrange_if_prompt)
        //设置了微信提醒
        formData.arrange_if_prompt_time = this.data.arrange_if_prompt_time

      //检查数据是否填写
      if (formData.arrange_content == "") {
        this.tips("请输入内容")
        return
      } else if (formData.arrange_place == "") {
        this.tips("请输入地点")
        return
      } else if (formData.arrange_date == "") {
        this.tips("请设置考研的日期")
        return
      } else if (formData.arrange_time == "") {
        this.tips("请设置考研的时间")
        return
      } else if (dateUtil.isEarlyFromNow(formData.arrange_date, formData.arrange_time)) {
        this.tips("考研的时间不能早于现在的时间")
        return
      } else if (formData.arrange_if_prompt) {
        //设置了提醒，需要检查提醒时间是否正确
        if (formData.arrange_if_prompt_date == "") {
          this.tips("请设置提醒日期")
          return
        } else if (formData.arrange_if_prompt_time == "") {
          this.tips("请设置提醒时间")
          return
        } else if (dateUtil.isEarlyFromNow(formData.arrange_if_prompt_date, formData.arrange_if_prompt_time)) {
          this.tips("提醒时间不能早于现在的时间")
          return
        } else if (dateUtil.isLateFromDate(formData.arrange_if_prompt_date, formData.arrange_if_prompt_time, formData.arrange_date, formData.arrange_time)) {
          this.tips("提醒时间不能晚于考研的时间")
          return
        }
      }

      //数据没有问题，区分是修改计划还是添加计划
      if (this.data.isModify) {
        //修改计划，检查是否修改过
        var changeFlag = formData.arrange_content != this.data.arrange_content ||
          formData.arrange_place != this.data.arrange_place ||
          formData.arrange_date != this.data.arrange_date ||
          formData.arrange_time != this.data.arrange_time ||
          (this.data.arrange_if_prompt ? 0 : 1 != formData.arrange_if_prompt ? 0 : 1) ||
          formData.arrange_if_prompt_date != this.data.arrange_if_prompt_date ||
          formData.arrange_if_prompt_time != this.data.arrange_if_prompt_time
        if (changeFlag) {
          //修改过
          formData.arrange_id = this.data.arrange_id
          formData.arrange_form_id = e.detail.formId
          this.triggerEvent("modify_confirm", formData)
        } else {
          //没有修改过，等同于取消
          this.hidden_dialog()
        }
      } else {
        //添加计划
        this.triggerEvent("add_confirm", formData)
      }
    },

    //隐藏弹框
    hideEdit: function() {
      this.setData({
        flag: true,
      })
    },

    //展示弹框
    showEdit() {
      if (this.data.isModify) {
        //修改
        this.setData({
          flag: false,
          dateStart: dateUtil.getFormatDate(),
          timeStart: dateUtil.getFormatTime(),
          promptDateStart: dateUtil.getFormatDate(),
          promptDateEnd: this.data.arrange_date,
        })
      } else {
        //添加
        this.setData({
          flag: false,
          arrange_id: "",
          arrange_content: "",
          arrange_place: "",
          arrange_if_prompt: false,
          arrange_date: "",
          arrange_time: "",
          arrange_if_prompt_date: "",
          arrange_if_prompt_time: "",
          dateStart: dateUtil.getFormatDate(),
          timeStart: dateUtil.getFormatTime(),
          promptDateStart: dateUtil.getFormatDate(),
          promptDateEnd: "",
        })
      }
    },

    //点击取消按钮
    hidden_dialog() {
      this.hideEdit()
      this.triggerEvent("hidden_dialog")
    },

    //日期选择
    bindDateChange(e) {
      //检查是不是今天的日期
      if (dateUtil.countDownFromToday(e.detail.value) == 0) {
        //今天的日期，时间要从现在时刻开始选择
        this.setData({
          timeStart: dateUtil.getFormatTime(),
        })
        //现在时刻晚于重设日期后的时间，时间要重设
        if (this.data.arrange_time != "" && dateUtil.isLateFromDate(dateUtil.getFormatDate(), dateUtil.getFormatTime(), e.detail.value, this.data.arrange_time)) {
          this.setData({
            arrange_time: dateUtil.getFormatTime(),
          })
        }
      } else {
        //不是今天的日期，时间可以从0点开始选择
        this.setData({
          timeStart: "00:00",
        })
      }
      this.setData({
        arrange_date: e.detail.value,
        promptDateEnd: e.detail.value,
        arrange_if_prompt_date: "",
        arrange_if_prompt_time: "",
      })
    },

    //时间选择
    bindTimeChange(e) {
      this.setData({
        arrange_time: e.detail.value,
        arrange_if_prompt_date: "",
        arrange_if_prompt_time: "",
      })
    },

    //是否设置微信提醒
    switchChange(e) {
      this.setData({
        arrange_if_prompt: e.detail.value
      })
    },

    //改变微信提醒日期
    bindPromptDateChange(e) {
      this.setData({
        arrange_if_prompt_date: e.detail.value
      })
    },

    //改变微信提醒时间
    bindPromptTimeChange(e) {
      var t = this.data.promptTimeSelect
      var i = e.detail.value
      this.setData({
        promptTimeSelectIndex: e.detail.value,
        arrange_if_prompt_time: t[0][i[0]] + ":" + t[1][i[1]]
      })
    },

    //蒙层点击事件
    preventTouchMove() {},

    //显示提示对话框
    tips(content) {
      wx.showModal({
        title: '提示',
        content: content,
        showCancel: false,
        confirmColor: "#04838e",
      })
    }
  }
})