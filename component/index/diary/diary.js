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
          wx.showToast({
            title: '请填写标题',
          })
          return
        } else if (rawData.diary_content == "") {
          wx.showToast({
            title: '请填写内容',
          })
          return
        }
        this.addDiary(rawData)
      } else {
        // //修改日记，判断是否修改过日记
        // if (!this.checkChange(e)) {
        //   //没有修改过日记，将对话框隐藏后返回
        //   this.hideDiary()
        //   return
        // } else 
        if (rawData.diary_title == "") {
          wx.showToast({
            title: '请填写标题',
          })
          return
        } else if (rawData.diary_content == "") {
          wx.showToast({
            title: '请填写内容',
          })
          return
        }
        this.modifyDiary(rawData)
      }
    },

    //展示弹框
    showDiary(dialogTitle, item) {
      if (item == null) {
        //新增日记
        this.setData({
          diary_title: "",
          diary_content: "",
          diary_write_place: "",
          diary_write_date: "",
          diary_write_time: "",
          currentWordNumber: 0, //当前字数
        })
      } else {
        this.setData({
          //修改日记
          diary_id: item.diary_id,
          diary_title: item.title,
          diary_content: item.content,
          diary_write_place: item.place,
          diary_write_date: item.date,
          diary_write_time: item.time,
          currentWordNumber: item.content.length, //当前字数
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
            image: '/images/fail.png',
            duration: 800
          })
          this.hideDiary()
        }
      }), rawData);

      this._successEvent();
    },

    //修改日记
    modifyDiary(rawData) {
      var that = this
      wx.showLoading({
        title: '保存信息中',
      })
      //向服务器发起请求，修改日记
      rawData.diary_write_date = that.data.diary_write_date
      rawData.diary_write_time = that.data.diary_write_time
      rawData.diary_id = that.data.diary_id
      // 显示加载中
      wx.hideLoading()
      model.modifyDiary(((data) => {
        if (data.error_code == '0') {
          wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 800
          })
          this.hideDiary()
        } else {
          wx.showToast({
            title: '修改失败',
            icon: 'fail',
            duration: 800
          })
          this.hideDiary()
        }
      }), rawData);

      this._successEvent();
    },

    //对话框显示时禁止下拉
    preventTouchMove: function() {},

    //获取当前位置
    getLocation() {
      var that = this
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.userLocation']) {
            wx.authorize({
              scope: 'scope.userLocation',
              success() {
                // 用户已经同意小程序使用地理位置，后续调用 wx.startRecord 接口不会弹窗询问
                wx.startRecord()
              }
            })
          }
        }
      })
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

    //获取新建日记时候的日期和时间
    getFormatTime(ifDate) {
      var that = this
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

    // //检查是否有信息键入/修改过
    // checkChange(e) {
    //   var beforeTitle = this.data.diaryTitle
    //   var beforeContent = this.data.diaryContent
    //   var beforeLocation = this.data.diaryLocation
    //   return !(beforeTitle == e.detail.value.diaryTitle && beforeContent == e.detail.value.diaryContent && beforeLocation == e.detail.value.diaryLocation)
    // },

    _successEvent() {
      //触发添加回调
      this.triggerEvent("successEvent")
    },

  }
})