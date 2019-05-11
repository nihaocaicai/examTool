import {
  Request
} from "../../../../utils/server/request.js"


class Setting {
  
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
  Setting
}