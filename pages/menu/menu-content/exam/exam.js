// pages/menu/menu-content/exam/exam.js
var examData = require('../../../../data/local_exam_database.js')

Page({
  data: {
    delBtnWidth: 160,
  },

  onLoad: function (options) {
    // 获取数据文件数据
    this.setData({
      examList:examData.examList
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
    //console.log(touch)
    for (var index in this.data.examList) {
      var items = this.data.examList[index]
      //console.log(item)
      for(var ind in items){
        var item=items[ind]
        //item.right = 0
      } 
    }

    this.setData({
      examList: this.data.examList,
      startX: touch.clientX,
    })

  },
  drawMove: function (e) {
    var touch = e.touches[0]
    var ind = e.currentTarget.dataset.ind
    var items = this.data.examList[ind].data
    var item = items[e.currentTarget.dataset.index]
    //console.log(item.right)
    var disX = this.data.startX - touch.clientX

    if (disX >= 20) {
      if (disX > this.data.delBtnWidth) {
        disX = this.data.delBtnWidth
      }
      item.right = disX
      this.setData({
        isScroll: false,
        examList: this.data.examList
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        examList: this.data.examList
      })
    }
  },
  drawEnd: function (e) {
    var ind = e.currentTarget.dataset.ind
    var items = this.data.examList[ind].data
    var item = items[e.currentTarget.dataset.index]
    if (item.right >= this.data.delBtnWidth / 2) {
      item.right = this.data.delBtnWidth
      this.setData({
        isScroll: true,
        examList: this.data.examList,
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        examList: this.data.examList,
      })
    }
  },
  //滑动组件end

  //修改
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

  //删除
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