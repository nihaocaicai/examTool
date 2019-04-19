var plansData = require('../../../data/local_plan_database.js')

Page({
  data: {
    // 设置滑动删除、编辑的宽度
    delBtnWidth: 160,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 获取数据文件数据
    this.setData({
      planList: plansData.planList
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    //获得edit组件
    this.edit = this.selectComponent("#edit");
    this.modify = this.selectComponent("#modify");
  },

  // 滑动组件star
  drawStart: function(e) {
    var touch = e.touches[0];
    // console.log(touch);
    for (var index in this.data.planList) {
      var items = this.data.planList[index].data
      // console.log(items)
      for (var ind in items) {
        var item = items[ind]
        item.right = 0
      }
    }

    this.setData({
      planList: this.data.planList,
      startX: touch.clientX,
    })

  },
  drawMove: function(e) {
    var touch = e.touches[0]
    var ind = e.currentTarget.dataset.ind
    var items = this.data.planList[ind].data
    var item = items[e.currentTarget.dataset.index]
    // console.log(item.right)
    var disX = this.data.startX - touch.clientX

    if (disX >= 20) {
      if (disX > this.data.delBtnWidth) {
        disX = this.data.delBtnWidth
      }
      item.right = disX
      this.setData({
        isScroll: false,
        planList: this.data.planList
      })
      // console.log(this.data.planList)
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        planList: this.data.planList
      })
    }
  },
  drawEnd: function(e) {
    var ind = e.currentTarget.dataset.ind
    var items = this.data.planList[ind].data
    var item = items[e.currentTarget.dataset.index]
    if (item.right >= this.data.delBtnWidth / 2) {
      item.right = this.data.delBtnWidth
      this.setData({
        isScroll: true,
        planList: this.data.planList
      })
    } else {
      item.right = 0
      this.setData({
        isScroll: true,
        planList: this.data.planList
      })
    }
  },
  // 滑动组件end
  // 修改
  modItem() {
    console.log("修改");
    this.modify.showEdit();
  },
  // 编辑
  delItem: function() {
    console.log("删除");
  },
  //取消事件
  _error() {
    console.log('你点击了取消');
    this.edit.hideEdit();
  },
  _errormodify() {
    console.log('你点击了取消');
    this.modify.hideEdit();
  },
  //确认事件
  _success() {
    console.log('你点击了确定');
    this.edit.hideEdit();
  },
  _successmodify() {
    console.log('你点击了确定');
    this.modify.hideEdit();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    console.log("添加");
    this.edit.showEdit();
  },
})