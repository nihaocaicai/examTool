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
    diaryContentMin: 0, //最少字数
    diaryContentMax: 140, //最多字数 (根据自己需求改变)
    diaryPlace: "点击获取位置",
  },

  /**
   * 组件的方法列表
   */
  methods: {
    formSubmit(e) {
      this.triggerEvent("save", e)
    },

    //textarea字数限制
    inputs: function(e) {
      // 获取输入框的内容
      var value = e.detail.value;
      // 获取输入框内容的长度
      var len = parseInt(value.length);

      //最少字数限制
      if (len <= this.data.min)
        this.setData({
          texts: "加油，够0个字哦"
        })
      else if (len > this.data.min)
        this.setData({
          texts: " "
        })

      //最多字数限制
      if (len > this.data.max)
        return;
      // 当输入框内容的长度大于最大长度限制（max)时，终止setData()的执行
      this.setData({
        currentWordNumber: len //当前字数  
      });
    },

    //隐藏弹框
    hideDiary: function() {
      this.setData({
        flag: true
      })
    },

    //展示弹框
    showDiary(dialogTitle) {
      this.setData({
        flag: false,
        dialogTitle: dialogTitle,
      })
    },

    //点击取消按钮
    _error() {
      this.hideDiary()
    },


    //获取当前位置
    getLocation() {
      console.log("获取位置")
    }
  }
})