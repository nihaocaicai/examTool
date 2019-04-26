var ip = "http://127.0.0.1:8080/examTool/"

var interfaces = {
  /* 用户登录 */
  getToken: "user/token", //获取token

    /* 用户信息 */
    getInfo: "user/info/show", //获取用户设置的基本信息
    postModifyInfo: "user/info/modify", //更新用户填写的信息

    /* 用户考研计划 */
    getBeforePlan: "user/plan/all/before", //获取用户全部考研计划（当天以前的，不包括当天）
    getAfterPlan: "user/plan/all/after", //获取用户全部考研计划（当天之后的，包括当天）
    getTodayPlan: "user/plans/all/intraday", //获取用户全部考研计划（当天的）
    postaddPlan: "user/plans/add", //添加考研计划（只能添加当天的或以后日期的）
    postModifyPlan: "user/plans/modify", //修改考研计划
    getDeletePlan: "user/plans/delete/", //删除考研计划，需要在地址后面加上要删除的计划ID

    /* 用户考研日记 */
    getAllDiary: "user/diarys/all", //获取用户全部考研日记
    postAddDiary: "user/diarys/add", //添加考研日记
    postModifyDiary: "user/diarys/modify", //修改考研日记
    getDeleteDiary: " user/diarys/delete/", //修改考研日记，需要在地址后面加上要删除的日记ID

    /* 用户考研安排 */
    getAllArrangements: "user/arrangements/all", //获取用户全部考研安排
    postAddArramgements: "user/arrangements/add", //添加考研安排
    postModifyArrangements: "user/arrangements/modify", //修改考研安排
    getDeleteArrangements: " user/arrangements/delete/", //修改考研安排，需要在地址后面加上要删除的安排ID
}

module.exports = {
  ip: ip,
  interface: interfaces,
}