import {
  Request
} from "../../utils/server/request.js"

var thisClass = this

class IndexComponent {
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
    r.setFailInfo("/pages/index/index-model.js", "getEverydayPlanFromServer")
    r.request({
      url: '/user/plans/all/intraday',
      success: callbacks.success,
      statusCodeFail: callbacks.fail,
      fail: callbacks.fail,
    })
  }

  /**
   * [向服务器提交修改的星星]
   */
  batchModifyToServer(params) {
    var r = new Request()
    r.setFailInfo("/pages/index/index-model.js", "batchModifyToServer")
    r.request({
      url: '/user/plans/batchmodify',
      method: "POST",
      data: params.data,
      success: params.success,
      fail: params.fail,
    })
  }
}

export {
  IndexComponent
}