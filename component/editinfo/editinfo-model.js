import {
  Request
} from "../../utils/server/request.js"

class EditInfoComponent {
  /**
   * [保存用户信息]
   */
  saveUserInfo(params) {
    var r = new Request()
    r.setFailInfo('/component/editinfo/editinfo-model.js', "saveUserInfo")
    r.request({
      url: "/user/info/modify",
      method: "POST",
      data: params.data,
      success: params.success,
      statusCodeFail: params.statusCodeFail,
      fail: params.fail,
    })
  }
}

export {
  EditInfoComponent
}