var app = getApp()
//var examData = require('../../../../data/local_exam_database.js')
//wx.setStorageSync("exam_arrangement", examData.examList)

class Exam {
  setPage(page) {
    this.page = page
  }

  //获取所有计划
  getAllArrangements() {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.ip + app.globalData.interface.getAllArrangements,
      data: {
        token: wx.getStorageSync("wx_user_info").token
      },
      success: function(res) {
        if (res.statusCode == 200) {
          try {
            wx.setStorageSync('exam_arrangement', res.data.exam_arrangement)
            that.getArrangementsFromCache()
            wx.hideLoading()
          } catch (e) {
            var errMsg = "存储到缓存错误:\n" + e
            that.isOffline(0, errMsg)
          }
        } else {
          var errMsg = "服务器错误，返回代码: " + res.statusCode
          that.isOffline(0, errMsg)
        }
      },
      fail: function(res) {
        var errMsg = "网络连接失败\n" + res
        that.isOffline(0, errMsg)
      }

    })
  }

  //下拉添加
  addItem() {
    this.page.editexam.setData({
      isModify: false,
    })
    this.page.editexam.showEdit()
  }

  //点击修改
  modItem(index) {
    var data = this.page.data.examList[index.dayindex]['data'][index.index]
    this.modify_arrangement_id = this.page.data.examList[index.dayindex]['data'][index.index].arrangement_id

    //日期和时间被放在一起保存了，所以需要分开
    var examDateAndTime = data.arrangement_time.split(" ")
    var promptDateAndTime = data.plan_if_prompt_time.split(" ")

    this.page.editexam.setData({
      isModify: true,
      arrangement_id: data.arrangement_id,
      arrangement_content: data.arrangement_content,
      arrangement_place: data.arrangement_place,
      plan_if_prompt: data.plan_if_prompt,
      arrangement_date: examDateAndTime[0],
      arrangement_time: examDateAndTime[1],
      plan_if_prompt_date: promptDateAndTime[0],
      plan_if_prompt_time: promptDateAndTime[1],
    })
    this.page.editexam.showEdit()
  }

  //点击删除
  delItem(index) {
    //index: [0,0]
    wx.showModal({
      title: '提示',
      content: '你确定要删除这项计划吗？\r\n',
      confirmColor: "#04838e",
      success(res) {
        if (res.confirm) {
          //点击确认
          console.log("确认删除")
        }
      }
    })
  }

  //修改保存
  modify_confirm(formData) {
    console.log("修改")
    formData.arrangement_id = this.modify_arrangement_id
    console.log(formData)
  }

  //添加保存
  add_confirm(formData) {
    console.log("添加")
    console.log(formData)
  }

  //从缓存获取用户安排
  getArrangementsFromCache() {
    var arrangements = wx.getStorageSync('exam_arrangement')
    if (arrangements != undefined) {
      this.page.setData({
        examList: arrangements,
        showView: arrangements.length != 0,
        loading: false,
      })
    }
  }

  //当前为离线模式
  isOffline(fromFlag, errMsg) {
    var t = "离线提示来源标签:" + fromFlag.toString() + "\n--错误信息--\n" + errMsg
    console.log(t)
    //提示离线模式
    if (!wx.getStorageSync('hideOfflineTips')) {
      if (fromFlag == 0) {
        //获取计划时失败的提示
        this.getArrangementsFromCache()
        wx.hideLoading()
        wx.showToast({
          title: '当前为离线模式',
          image: "/images/login_fail.png",
          duration: 1800,
        })
      }
    }
  }
}

export {
  Exam
};