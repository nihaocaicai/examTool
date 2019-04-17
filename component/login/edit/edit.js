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
  },

  /* 生命周期函数 */
  lifetimes: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    formSubmit(e) {
      //判断数据填写是否符合要求
      var formData = e.detail.value
      var formProName = Object.getOwnPropertyNames(formData)
      var isRight = true
      for (var i in formProName)
        isRight = isRight && formData[formProName[i]]

      //检查考研时间和日期是否正确，并且设置倒计时时间
      formData['countdown'] = 55;

      //跳过设置信息
      // isRight = true
      if (isRight) {
        //调用成功保存回调函数
        this.triggerEvent("save", formData)
      } else {
        wx.showModal({
          title: '提示',
          content: '你的填写有错误哦！每一项都要填写~',
          showCancel: false,
        })
      }
    },
    //隐藏弹框
    hideEdit: function() {
      this.setData({
        flag: !this.data.flag
      })
    },
    //展示弹框
    showEdit() {
      this.setData({
        flag: !this.data.flag
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
        date: e.detail.value
      })
    },
    /*
     * 内部私有方法建议以下划线开头
     * triggerEvent 用于触发事件
     */
    _error() {
      //触发取消回调
      this.triggerEvent("error")
    },
    _success() {
      //触发成功回调
      this.triggerEvent("success")
    },
  }
})