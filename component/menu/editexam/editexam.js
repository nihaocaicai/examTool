import {
  DateUtil
} from "../../../utils/DateUtil.js"
var dateUtil = new DateUtil()
const defaultPromptTimeSelect = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15 ', '16', '17', '18', '19', '20', '21', '22', '23'] // 默认提醒时间选择器
const defaultPromptTimeSelectIndex = [0, 0]

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
    limitTips: '由于微信限制，只能设置在未来 7 天内提示',
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

      //数据没有问题，先拼装数据
      formData.arrange_if_prompt = formData.arrange_if_prompt ? 1 : 0 //是否设置提醒
      formData.arrange_form_id = e.detail.formId //formId

      //区分是修改计划还是添加计划
      if (this.data.isModify) {
        //修改计划，检查是否修改过
        var changeFlag = formData.arrange_content != this.data.beforeData.arrange_content ||
          formData.arrange_place != this.data.beforeData.arrange_place ||
          formData.arrange_date != this.data.beforeData.arrange_date ||
          formData.arrange_time != this.data.beforeData.arrange_time ||
          formData.arrange_if_prompt ? 1 : 0 != this.data.beforeData.arrange_if_prompt ? 1 : 0 ||
          formData.arrange_if_prompt_date != this.data.beforeData.arrange_if_prompt_date ||
          formData.arrange_if_prompt_time != this.data.beforeData.arrange_if_prompt_time
        if (changeFlag) {
          //修改过
          formData.arrange_id = this.data.arrange_id
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
        arrange_if_prompt: false,
        disableSwitchChange: false,
      })
    },

    //展示弹框
    showEdit() {
      if (this.data.isModify) {
        //修改
        var d = new Date(this.data.arrange_date + " " + this.data.arrange_time)
        var ifPrompt = this.data.arrange_if_prompt
        this.setData({
          flag: false,
          arrange_if_prompt: dateUtil.countDownTimeFromToday(d, 604800000) == 1 ? false : ifPrompt,
          dateStart: dateUtil.getFormatDate(),
          timeStart: this.data.arrange_date == dateUtil.getFormatDate() ? dateUtil.getFormatTime() : "00:00",
          promptDateStart: dateUtil.getFormatTime(1) == 23 ? dateUtil.getNextDate() : dateUtil.getFormatDate(),
          promptDateEnd: dateUtil.getPromptDate(this.data.arrange_date),
        })
        if (!this.data.arrange_if_prompt) {
          this.setData({
            arrange_if_prompt_date: "",
            arrange_if_prompt_time: "",
          })
        }
        this._changePromptTimeChangeSelect(0)
      } else {
        //添加
        this.setData({
          flag: false,
          disableSwitchChange: true,
          arrange_id: "",
          arrange_content: "",
          arrange_place: "",
          arrange_if_prompt: false,
          arrange_date: "",
          arrange_time: "",
          arrange_if_prompt_date: "",
          arrange_if_prompt_time: "",
          promptTimeSelect: defaultPromptTimeSelect,
          promptTimeSelectIndex: defaultPromptTimeSelectIndex,
          dateStart: dateUtil.getFormatDate(),
          timeStart: "00:00",
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
      if (this.data.arrange_date != e.detail.value) {
        //检查是不是今天的日期
        if (dateUtil.countDownDateFromToday(e.detail.value) == 0) {
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
          disableSwitchChange: true,
          arrange_if_prompt: false,
          arrange_if_prompt_date: "",
          arrange_if_prompt_time: "",
        })
        this._checkDate()
      }
    },

    //时间选择
    bindTimeChange(e) {
      if (this.data.arrange_time != e.detail.value) {
        this.setData({
          arrange_time: e.detail.value,
          disableSwitchChange: true,
          arrange_if_prompt: false,
          arrange_if_prompt_date: "",
          arrange_if_prompt_time: "",
        })
        this._checkDate()
      }
    },

    //检查日期
    _checkDate() {
      var date = this.data.arrange_date
      var time = this.data.arrange_time
      if (this.data.disableSwitchChange && date && time) {
        //日期设置好了，解除按钮禁止
        this.setData({
          disableSwitchChange: false,
        })
      }
      if (date && time) {
        this.setData({
          promptDateEnd: dateUtil.getPromptDate(date),
        })
        this._changePromptTimeChangeSelect()
      }
    },

    //是否设置微信提醒
    switchChange(e) {
      this.setData({
        arrange_if_prompt: e.detail.value
      })
      if (!e.detail.value) {
        //不开启提醒，清除数据
        this.setData({
          arrange_if_prompt_date: "",
          arrange_if_prompt_time: "",
        })
      }
    },

    /**
     * [点击微信提醒按钮] 
     * 点击微信提醒按钮前检查是否设置考研的日期和时间
     */
    tapSwitch() {
      if (!this.data.arrange_date || !this.data.arrange_time) {
        wx.showModal({
          title: '提示',
          content: '请先设置考研的日期和时间后再试试',
          showCancel: false,
          confirmText: "好的",
          confirmColor: "#04838e"
        })
      }
    },

    //改变微信提醒日期
    bindPromptDateChange(e) {
      if (this.data.arrange_if_prompt_date != e.detail.value) {
        this.setData({
          arrange_if_prompt_date: e.detail.value,
          arrange_if_prompt_time: "",
        })
        this._changePromptTimeChangeSelect()
      }
    },

    //改变微信提醒时间选择范围
    _changePromptTimeChangeSelect(type) {
      var date = this.data.arrange_if_prompt_date
      var promptTimeSelect = [].concat(defaultPromptTimeSelect) //数组是引用，不是赋值，需要进行复制操作
      if (date) {
        var dayArray = dateUtil.getPromptTime(date)
        if (dayArray[1] - dayArray[0] != 24)
          promptTimeSelect = promptTimeSelect.splice(dayArray[0], dayArray[1])
      }
      this.setData({
        promptTimeSelect: promptTimeSelect,
        promptTimeSelectIndex: 0,
      })
    },

    //改变微信提醒时间
    bindPromptTimeChange(e) {
      var t = this.data.promptTimeSelect
      var i = e.detail.value
      this.setData({
        promptTimeSelectIndex: i,
        arrange_if_prompt_time: t[i] + ":00"
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