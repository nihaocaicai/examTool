var data = require("../../../../data/examtool-data.js")
class Diary {
  setPage(page) {
    this.page = page
  }

  //从服务器获取信息
  getDataFromService() {
    var that = this
    var rawData
    wx.showLoading({
      title: '加载中',
    })
    //Todo 从服务器获取信息
    //success: 成功获取信息
    setTimeout(function() {
      try {
        rawData = data.postList[0].exam_diary //new Array() //这里应该是从网络上获取到的数据
        if (rawData.length == 0) {
          //没有日记，不需要处理数据
          that.page.setData({
            showView: false,
          })
        } else {
          that.processRawData(rawData)
        }
        wx.setStorageSync('diary', rawData)
        that.page.setData({
          loading: false
        })
        wx.hideLoading()
      } catch (e) {
        //保存数据到缓存出错
        console.log("保存数据到缓存出错，在函数getDataFromService\n", e)
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '获取信息出错，可能是空间不足，请清理手机内存后重试',
          showCancel: false,
          confirmColor: '#04838e',
          success: function(res) {
            if (res.confirm) {
              that.page.setData({
                loading: false
              })
            }
          }
        })
      }
    }, 1000)
    //fail: 离线，只能本地查看
    /*
    rawData = wx.getStorageSync('diary')
    that.processRawData(rawData)
    wx.showModal({
      title: '提示',
      content: '无法连接到服务器。\r\n在脱机状态下，只能查看，不能进行编辑和删除操作',
      showCancel: false,
      confirmColor: "#04838e",
      success: function(res) {
        if (res.confirm) {
          that.page.setData({
            loading: false
          })
        }
      }
    })
    */
  }

  //对获取到的数据进行处理，无论是从服务器还是从缓存获得
  processRawData(rawData) {
    for (var i in rawData)
      for (var j in rawData[i].data)
        rawData[i].data[j].right = 0
    this.page.setData({
      data: rawData,
      showView: true,
    })
  }

  //添加成功后执行的操作
  add_confirm(e){
    //重新像服务器获取信息
    this.getDataFromService()
  }

  //修改成功后执行的操作
  modify_confirm(e) {
    var rawData = e.detail
    var dayIndex = this.page.data.modifyIndex[0]
    var index = this.page.data.modifyIndex[1]
    var newData = this.page.data.data[dayIndex]['data'][index]
    //存入信息
    newData.diary_title = rawData.diaryTitle
    newData.diary_content = rawData.diaryContent
    newData.diary_write_place = rawData.diaryLocation
    newData.right = 0
    this.page.data.data[dayIndex]['data'][index] = newData
    wx.setStorageSync('diary', this.page.data.data)
    this.page.setData({
      data: this.page.data.data
    })
  }

  //删除日记
  del(dayIndex, index, itemID) {
    wx.showLoading({
      title: '删除中',
    })
    //向服务器发送请求，要求删除 diary_id 为 itemID 的日记项目
    //success:
    var newData = this.page.data.data
    newData[dayIndex]['data'].splice(index, 1)

    //如果删除后当天项目没有日记了，就从列表中清除这一天
    if (newData[dayIndex]['data'].length == 0)
      newData.splice(dayIndex, 1)
    try {
      wx.setStorageSync('diary', newData)

      if (newData.length == 0) {
        //没有日记了
        this.page.setData({
          showView: false,
        })
      }
      this.page.setData({
        lastScroll: [-1, -1],
        data: newData
      })
      wx.hideLoading()
    } catch (e) {
      wx.hideLoading()
      console.log("删除日记失败，在函数 delItem，错误原因：\n", e)
      wx.showModal({
        title: '提示',
        content: '删除失败，可能是手机存储空间不足，请清理一下后重试',
        showCancel: false,
        confirmColor: "#04838e"
      })
    }
    //fail:
    /*
    wx.hideLoading()
    wx.showModal({
      title: '提示',
      content: '删除失败，请检查网络设置',
      showCancel: false,
      confirmColor: "#04838e"
    })

    */
  }
}

export {
  Diary
}