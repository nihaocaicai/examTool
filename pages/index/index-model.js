import {
  Request
} from "../../utils/server/request.js"

var thisClass = this

class Index {
  constructor() {
    thisClass = this
  }

  setPage(page) {
    thisClass.page = page
  }

  /**
   * [从服务器上获取今天的计划 everyday_planList]
   */
  getEverydayPlanFromServer(callbacks) {
    var r = new Request()
    r.setFailInfo("index-model.js", "getEverydayPlanFromServer")
    r.request({
      url: '/user/plans/all/intraday',
      success: callbacks.success,
      statusCodeFail: callbacks.fail,
      fail: callbacks.fail,
    })
  }
}

export {
  Index
}