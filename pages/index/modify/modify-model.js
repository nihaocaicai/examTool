import {
  Request
} from "../../../utils/server/request.js"

var thisClass = this

class Modify {
  constructor() {
    thisClass = this
  }

  setPage(page) {
    thisClass.page = page
  }

  /**
   * [从服务器上获取今天的计划 everyday_planList]
   */
  getAllDiary(callbacks) {
    var r = new Request()
    r.setFailInfo("diary-model.js", "getAllDiary")
    r.request({
      url: "/user/diarys/all",
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
  Modify
}