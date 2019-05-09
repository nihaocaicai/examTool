import {
  DiaryComponent
} from "diary-model.js"

var model = new DiaryComponent()

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },

  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    flag: true,
    diary_write_place: "",
    diaryContentMin: 0, //最少字数
    diaryContentMax: 140, //最多字数 (根据自己需求改变)
  },

  /**
   * 组件的方法列表
   */
  methods: {
    formSubmit(e) {
      var rawData = e.detail.value
      e.detail.value['diary_write_place'] = this.data.diary_write_place
      if (this.data.item == null) {
        //新增日记
        if (rawData.diary_title == "") {
          wx.showModal({
            title: '提示',
            content: '请填写标题',
            showCancel: false,
            confirmColor: "#04838e",
          })
          return
        } else if (rawData.diary_content == "") {
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
        } else if (rawData.diary_title == "") {
          wx.showModal({
            title: '提示',
            content: '请填写标题',
            showCancel: false,
            confirmColor: "#04838e",
          })
          return
        } else if (rawData.diary_content == "") {
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
      this.triggerEvent("hidden")
    },

    //对话框显示时禁止下拉
    preventTouchMove: function() {},

    //获取当前位置
    getLocation() {
      var that = this
      wx.chooseLocation({
        type: 'wgs84',
        success: function(res) {
          if (res.name != "")
            that.setData({
              diary_write_place: res.name
            })
        },
      })
    },


    //获取新建/修改日记时候的日期和时间
    getFormatTime(ifDate) {
      var that =this
      var date = new Date()
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()

      var hour = date.getHours()
      var minute = date.getMinutes()
      var second = date.getSeconds()

      if (ifDate == "date") {
        return [year, month, day].map(that.formatNumber).join('-') 
      } else {
        return [hour, minute, second].map(that.formatNumber).join(':')
      }

    },
    formatNumber(n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    },


    //检查是否有信息键入/修改过
    checkChange(e) {
      var beforeTitle = this.data.diaryTitle
      var beforeContent = this.data.diaryContent
      var beforeLocation = this.data.diaryLocation
      return !(beforeTitle == e.detail.value.diaryTitle && beforeContent == e.detail.value.diaryContent && beforeLocation == e.detail.value.diaryLocation)
    },

    //保存日记
    addDiary(rawData) {
      var that = this
      wx.showLoading({
        title: '保存信息中',
      })
      //向服务器发起请求，添加日记
      rawData.diary_write_date = that.getFormatTime("date")
      rawData.diary_write_time = that.getFormatTime("time")
      // 显示加载中
      wx.hideLoading()
      model.addDiary(((data) => {
        if (data.error_code == '0') {
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 800
          })
          this.hideDiary()
        } else {
          wx.showToast({
            title: '添加失败',
            icon: 'fail',
            duration: 800
          })
          this.hideDiary()
        }
      }), rawData);
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
    },

  }
})