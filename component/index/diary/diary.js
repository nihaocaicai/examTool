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
    diaryContentMin: 0, //最少字数
    diaryContentMax: 140, //最多字数 (根据自己需求改变)
  },

  /**
   * 组件的方法列表
   */
  methods: {
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
      })
    },

    //点击取消按钮
    _error() {
      this.hideDiary()
    },
    // 点击确认按钮
    formSubmit(e) {
      this.triggerEvent("save", e)
      this.hideDiary()
    },
  }
})