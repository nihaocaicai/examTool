Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },

  /**
   * 组件的属性列表
   */
  properties: {
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    flag: true,
    hidden_time:true,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //隐藏弹框
    hideEdit: function () {
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

    // 组件表单提交数据
    formSubmit(e) {
      console.log('form发生了submit事件，携带数据为：', e.detail.value)
    },
    // 组件表单相关方法

    bindStarDateChange(e) {
      console.log('stardate发送选择改变，携带值为', e.detail.value)
      this.setData({
        stardate: e.detail.value
      })
    },
    bindStarTimeChange(e) {
      console.log('startime发送选择改变，携带值为', e.detail.value)
      this.setData({
        startime: e.detail.value
      })
    },
    bindEndTimeChange(e) {
      console.log('endtime发送选择改变，携带值为', e.detail.value)
      this.setData({
        endtime: e.detail.value
      })
    },
    bindPointTimeChange(e) {
      console.log('point_time发送选择改变，携带值为', e.detail.value)
      this.setData({
        point_time: e.detail.value
      })
    },
    switch1Change(e) {
      console.log('switch1 发生 change 事件，携带值为', e.detail.value)
    },
    switch2Change(e) {
      console.log('switch2 发生 change 事件，携带值为', e.detail.value)
      this.setData({
        hidden_time: !this.data.hidden_time
      })
    }
  }
})