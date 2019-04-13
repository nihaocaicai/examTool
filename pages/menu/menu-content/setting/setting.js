// pages/menu/menu-content/setting/setting.js
Page({
  onReady: function () {
    this.edit = this.selectComponent("#edit") //获得diary组件
  },
  /* 考研小日志 diary 对话框 */
  //显示对话框事件
  showEdit() {
    this.edit.showEdit();
  },

  //回调 取消事件
  _error() {
    console.log('你点击了取消');
    this.edit.hideEdit();
  },
  //回调 确认事件
  _success() {
    console.log('你点击了确定');
    this.edit.hideEdit();
  },
  downLogin(){
    console.log('退出登录');
  }
})