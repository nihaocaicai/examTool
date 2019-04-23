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
    diaryLocation: "",
    diaryContentMin: 0, //最少字数
    diaryContentMax: 140, //最多字数 (根据自己需求改变)
  },

  /**
   * 组件的方法列表
   */
  methods: {
    formSubmit(e) {
      var rawData = e.detail.value
      e.detail.value['diaryLocation'] = this.data.diaryLocation
      if (this.data.item == null) {
        //新增日记
        if (rawData.diaryTitle == "") {
          wx.showModal({
            title: '提示',
            content: '请填写标题',
            showCancel: false,
            confirmColor: "#04838e",
          })
          return
        } else if (rawData.diaryContent == "") {
          wx.showModal({
            title: '提示',
            content: '请填写内容',
            showCancel: false,
            confirmColor: "#04838e",
          })
          return
        }
        this.addDiary(rawData)
      } else {
        //修改日记，判断是否修改过日记
        if (!this.checkChange(e)) {
          //没有修改过日记，将对话框隐藏后返回
          this.hideDiary()
          return
        } else if (rawData.diaryTitle == "") {
          wx.showModal({
            title: '提示',
            content: '请填写标题',
            showCancel: false,
            confirmColor: "#04838e",
          })
          return
        } else if (rawData.diaryContent == "") {
          wx.showModal({
            title: '提示',
            content: '请填写内容',
            showCancel: false,
            confirmColor: "#04838e",
          })
          return
        }
        this.modifyDiary(rawData)
      }
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
        currentWordNumber: len, //当前字数
      });
    },

    //展示弹框
    showDiary(dialogTitle, item) {
      if (item == null) {
        //新增日记
        this.setData({
          diaryTitle: "",
          diaryContent: "",
          diaryLocation: "",
          currentWordNumber: 0,
        })
      } else {
        this.setData({
          //修改日记
          diaryID: item.diary_id,
          diaryTitle: item.diary_title,
          diaryContent: item.diary_content,
          diaryLocation: item.diary_write_place,
          currentWordNumber: item.diary_content.length,
        })
      }
      this.setData({
        flag: false,
        dialogTitle: dialogTitle,
        idEdit: false,
        item: item,
      })
    },

    //点击取消按钮隐藏弹框
    hideDiary() {
      this.setData({
        flag: true
      })
    },

    //获取当前位置
    getLocation() {
      var that = this
      wx.chooseLocation({
        type: 'wgs84',
        success: function(res) {
          if (res.name != "")
            that.setData({
              diaryLocation: res.name
            })
        },
      })
    },

    //保存日记
    addDiary(rawData) {
      //未完成
      var that = this
      wx.showLoading({
        title: '保存信息中',
      })
      //向服务器发起请求，要求保存日记
      //传送数据：封装好的数据
      //success: 服务器存储成功，修改本地缓存
      wx.hideLoading()
      try {
        this.triggerEvent("add_confirm", rawData)
        this.hideDiary()
      } catch (e) {
        console.log("修改单条日记出错，在 modifyDiary 中，错误原因:\n", e)
        wx.showModal({
          title: '提示',
          content: '修改日记失败，可能是是手机存储空间不足，请清理一下手机空间后重试',
          confirmColor: '#04838e',
          showCancel: false,
        })
      }
      //fail: 服务器连接失败
      /*
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '保存日记失败，请检查网络连接是否正确',
        confirmColor: '#04838e',
        showCancel: false,
      })
      */
    },

    //修改日记
    modifyDiary(rawData) {
      var that = this
      wx.showLoading({
        title: '修改信息中',
      })
      //封装数据
      rawData['diary_id'] = this.data.diaryID
      //向服务器发起请求，要求保存日记
      //传送数据：封装好的数据
      //success: 服务器存储成功，修改本地缓存
      try {
        this.triggerEvent("modify_confirm", rawData)
        wx.hideLoading()
        this.hideDiary()
      } catch (e) {
        console.log("修改单条日记出错，在 modifyDiary 中，错误原因:\n", e)
        wx.showModal({
          title: '提示',
          content: '修改日记失败，可能是是手机存储空间不足，请清理一下手机空间后重试',
          confirmColor: '#04838e',
          showCancel: false,
        })
      }
      //fail: 服务器连接失败
      /*
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '修改日记失败，请检查网络连接是否正确',
        confirmColor: '#04838e',
        showCancel: false,
      })
      */
    },

    //检查是否有信息键入/修改过
    checkChange(e) {
      var beforeTitle = this.data.diaryTitle
      var beforeContent = this.data.diaryContent
      var beforeLocation = this.data.diaryLocation
      return !(beforeTitle == e.detail.value.diaryTitle && beforeContent == e.detail.value.diaryContent && beforeLocation == e.detail.value.diaryLocation)
    },
    //获取新建/修改日记时候的日期
    getFormatTime() {
      var today = new Date()
      return [today.getHours(), today.getMinutes()].map(
        function formatNumber(n) {
          n = n.toString()
          return n[1] ? n : '0' + n
        }
      ).join(':')
    },

    //检查是否有信息键入/修改过
    checkChange(e) {
      var beforeTitle = this.data.diaryTitle
      var beforeContent = this.data.diaryContent
      var beforeLocation = this.data.diaryLocation
      return !(beforeTitle == e.detail.value.diaryTitle && beforeContent == e.detail.value.diaryContent && beforeLocation == e.detail.value.diaryLocation)
    }
  }
})