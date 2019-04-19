import {
  DateUtil
} from "../../utils/DateUtil.js"
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
      value: '确定'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    flag: true,
    isLogin: true, //是否是登录的时候设置
    goal_university: "",
    goal_major: "",
    motto: "",
  },

  /* 生命周期函数 */
  lifetimes: {},

  /**
   * 组件的方法列表
   */
  methods: {
    formSubmit(e) {
      //判断数据填写是否符合要求
      var formData = e.detail.value
      var notSetFlag = null

      //检查生日设置是否正确
      if (formData.birthday != notSetFlag && parseInt(dateUtil.countDownFromToday(formData.birthday)) >= 0) {
        wx.showModal({
          title: '提示',
          content: '生日不能设置为今天或未来的日期',
          showCancel: false,
        })
        return
      }

      //检查考研日期是否设置正确
      if (formData.examDate != notSetFlag && parseInt(dateUtil.countDownFromToday(formData.examDate)) < 0) {
        wx.showModal({
          title: '提示',
          content: '考研日期不能设置为过去的日期',
          showCancel: false,
        })
        return
      }
      this.triggerEvent("save", formData)
    },
    //隐藏弹框
    hideEdit: function() {
      this.setData({
        flag: true
      })
    },
    //展示弹框
    showEdit() {
      this.setData({
        flag: false
      })
    },
    //修改生日
    bindBirthdayChange(e) {
      this.setData({
        birthday: e.detail.value
      })
    },
    //修改考研日期
    bindDateChange(e) {
      this.setData({
        examDate: e.detail.value
      })
    },
    
    //点击 生日 删除键
    cleanBirthday(){
      this.setData({
        birthday: null
      })
    },

    //点击 考研日期 删除键
    cleanExamDate() {
      this.setData({
        examDate: null
      })
    },

    //点击取消按钮
    _error() {
      this.triggerEvent("error")
    }
  }
})