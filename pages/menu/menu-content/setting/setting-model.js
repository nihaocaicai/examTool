import {
  Request
} from "../../../../utils/server/request.js"


class SettingComponent {
  /**
   * [保存用户信息]
   */
  saveUserInfo(params) {
    var r = new Request()
    r.setFailInfo('/pages/menu/menu-content/setting/setting-model.js', "saveUserInfo")
    r.request({
      url: "/user/info/modify",
      method: "POST",
      data: params.data,
      success: params.success,
      statusCodeFail: params.statusCodeFail,
      fail: params.fail,
    })
  }

  /**
   * [删除账户信息]
   */
  deleteAccount(callbacks) {
    var r = new Request()
    r.setFailInfo('/pages/menu/menu-content/setting/setting-model.js', "deleteAccount")
    r.request({
      url: "/user/info/delete",
      success: callbacks.success,
      fail: callbacks.fail,
    })
  }
}

export {
  SettingComponent
}