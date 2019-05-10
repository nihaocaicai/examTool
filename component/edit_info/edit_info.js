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
    isFirstLogin: true, //是否是登录的时候设置(login-model.js设置为true，setting-model.js设置为false)
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
      if (formData.birthday != notSetFlag && parseInt(dateUtil.countDownTimeFromToday(formData.birthday)) >= 0) {
        wx.showModal({
          title: '提示',
          content: '生日不能设置为今天或未来的日期',
          showCancel: false,
        })
        return
      }

      //检查考研日期是否设置正确
      if (formData.examDate != notSetFlag && parseInt(dateUtil.countDownTimeFromToday(formData.examDate)) < 0) {
        wx.showModal({
          title: '提示',
          content: '考研日期不能设置为过去的日期',
          showCancel: false,
        })
        return
      }

      if (this.data.isFirstLogin) {
        //第一次登录，不需要检查是否修改
        formData.birthday = formData.birthday == null ? "" : formData.birthday
        formData.examDate = formData.examDate == null ? "" : formData.examDate
        console.log(formData)
        this.triggerEvent("save", formData)
      } else {
        //在修改页面，需要检查是否进行过修改
        var isChanged = formData.birthday != this.data.beforeData['birthday'] || formData.examDate != this.data.beforeData['examDate'] || formData.goal_university != this.data.beforeData['goal_university'] || formData.goal_major != this.data.beforeData['goal_major'] || formData.motto != this.data.beforeData['motto']
        if (isChanged) {
          this.triggerEvent("save", formData)
        } else {
          //如果没有修改，等同于点击取消
          this.triggerEvent("error")
        }
      }
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

    //点击取消按钮
    _error() {
      this.triggerEvent("error")
    },

    //对话框显示时禁止下拉
    preventTouchMove: function() {},
  }
})