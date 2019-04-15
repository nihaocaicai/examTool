// pages/menu/menu-content/exam/exam.js
Page({
  data: {
    delBtnWidth: 160,
    data: [{ right: 0 }, { right: 0 }, { right: 0 }, { right: 0 }],
    isScroll: true,
    windowHeight: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //获得edit组件
    this.editexam = this.selectComponent("#editexam");
    this.modifyexam = this.selectComponent("#modifyexam");
  },

  drawStart: function (e) {
    // console.log("drawStart");  
    var touch = e.touches[0]

    for (var index in this.data.data) {
      var item = this.data.data[index]
      item.right = 0
    }
    this.setData({
      data: this.data.data,
      startX: touch.clientX,
    })

  },
  drawMove: function (e) {
    var touch = e.touches[0]
    var item = this.data.data[e.currentTarget.dataset.index]
    var disX = this.data.startX - touch.clientX

    if (disX >= 20) {
      if (disX > this.data.delBtnWidth) {
        disX = this.data.delBtnWidth
      }
      item.right = disX
      this.setData({
        isScroll: false,
        data: this.data.data
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        data: this.data.data
      })
    }
  },
  drawEnd: function (e) {
    var item = this.data.data[e.currentTarget.dataset.index]
    if (item.right >= this.data.delBtnWidth / 2) {
      item.right = this.data.delBtnWidth
      this.setData({
        isScroll: true,
        data: this.data.data,
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        data: this.data.data,
      })
    }
  },

  modItem() {
    console.log("修改");
    this.modifyexam.showEdit();
  },
  //取消事件
  _errorexam() {
    console.log('你点击了取消');
    this.editexam.hideEdit();
  },
  _errormodifyexam() {
    console.log('你点击了取消');
    this.modifyexam.hideEdit();
  },
  //确认事件
  _successexam() {
    console.log('你点击了确定');
    this.editexam.hideEdit();
  },
  _successmodifyexam() {
    console.log('你点击了确定');
    this.modifyexam.hideEdit();
  },


  delItem: function () {
    console.log("删除");
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("添加");
    this.editexam.showEdit();
  }
})