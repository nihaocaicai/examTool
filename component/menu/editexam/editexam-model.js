import {
  Request
} from "../../../utils/server/request.js"

var path = "/component/menu/editexam/editexam-model.js"

class EditExamComponent {
  /**
   * [添加考研安排]
   */
  addArramgements(params) {
    var r = new Request()
    r.setFailInfo(path, "addArramgements")
    r.request({
      url: '/user/arrangements/add',
      method: "POST",
      data: params.data,
      success: params.success,
      statusCodeFail: params.statusCodeFail,
      fail: params.fail,
    })
  }

  /**
   * [修改考研安排]
   */
  modifyArrangements(params) {
    var r = new Request()
    r.setFailInfo(path, "modifyArrangements")
    r.request({
      url: '/user/arrangements/modify',
      method: "POST",
      data: params.data,
      success: params.success,
      statusCodeFail: params.statusCodeFail,
      fail: params.fail,
    })
  }
}

export {
  EditExamComponent
}