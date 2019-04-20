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
    try {
      rawData = data.postList[0].exam_diary
      wx.setStorageSync('diary', rawData)
      that.processRawData(rawData)
    } catch (e) {
      //保存数据到缓存出错
      console.log("保存数据到缓存出错，在函数getDataFromService\n", e)
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '获取信息出错，可能是空间不足，请清理手机内存后重试',
        showCancel: false,
        confirmColor: '#04838e',
      })
    }
    //fail: 离线，只能本地查看
    /*
    rawData = wx.getStorageSync('diary')
    that.processRawData(rawData)
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
    wx.hideLoading()
  }
}

export {
  Diary
}