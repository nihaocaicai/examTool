import {
  Request
} from "../../utils/server/request.js"

class EditInfoComponent {
  /**
   * [保存用户信息]
   */
  saveUserInfo(success,data) {
    console.log(data)
    var r = new Request()
    r.setFailInfo('/component/editinfo/editinfo-model.js', "saveUserInfo")
    r.request({
      url: "/user/info/modify",
      method: "POST",
      data:data,
      success: function (data) {
        //不做处理，直接把data返回到index.js回去 data = data;
        success && success(data);
      }
    })
  }
}

export {
  EditInfoComponent
}