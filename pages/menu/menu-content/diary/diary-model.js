import {
  Request
} from "../../../../utils/server/request.js"

var thisClass = this

class Diary {
  constructor() {
    thisClass = this
  }

  setPage(page) {
    thisClass.page = page
  }

  /**
   * [从服务器上获取今天的计划 everyday_planList]
   */
  getAllDiary(params) {
    var r = new Request()
    r.setFailInfo("diary-model.js", "getAllDiary")
    r.request({
      url: "/user/diarys/all",
      data: {
        page: params.page
      },
      success: params.success,
      fail: params.fail,
    })
  }

  deleteDiary(callbacks,diary_id) {
    var r = new Request()
    r.setFailInfo("diary-model.js", "deleteDiary")
    r.request({
      url: '/user/diarys/delete?diary_id=' + diary_id,
      success: function (data) {
        //不做处理，直接把data返回到index.js回去 data = data;
        callbacks && callbacks(data);
      },
      fail: function (data) {
        //不做处理，直接把data返回到index.js回去 data = data;
        callbacks && callbacks(data);
      },
    })
  }
}

export {
  Diary
}