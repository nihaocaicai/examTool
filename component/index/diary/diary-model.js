import {
  Request
} from "../../../utils/server/request.js"

var thisClass = this

class DiaryComponent {
  constructor() {
    thisClass = this
  }

  /**
   * [向服务器上添加计划]
   */
  addDiary(callbacks,data) {
    var r = new Request()
    r.setFailInfo("diary-model.js", "addDiary")
    r.request({
      url: "/user/diarys/add",
      method: "POST",
      data: data,
      success: function (data) {
        //不做处理，直接把data返回到index.js回去 data = data;
        callbacks && callbacks(data);
      },
      fail: function(data) {
        //不做处理，直接把data返回到index.js回去 data = data;
        callbacks && callbacks(data);
      },
    })
  }

  /**
     * [向服务器上修改计划]
     */
  modifyDiary(callbacks, data) {
    var r = new Request()
    r.setFailInfo("diary-model.js", "modifyDiary")
    r.request({
      url: "/user/diarys/modify",
      method: "POST",
      data: data,
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
  DiaryComponent
}