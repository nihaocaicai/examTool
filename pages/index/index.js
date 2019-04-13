Page({
  onReady: function () {
    //获得diary组件
    this.diary = this.selectComponent("#diary");
  },

  showDiary() {
    this.diary.showDiary();
  },

  //取消事件
  _error() {
    console.log('你点击了取消');
    this.diary.hideDiary();
  },
  //确认事件
  _success() {
    console.log('你点击了确定');
    this.diary.hideDiary();
  },
  goToModify() {
    wx.navigateTo({
      url: '../index/modify/modify',
    })
  }
})