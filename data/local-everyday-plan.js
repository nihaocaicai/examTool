// 本数据文件的date值都是当天，也就是此文件设置的是首页今天的计划展示
var everyday_planList = {
  // 这里日期假设是当天的日期
  date: "2019-04-13",
  data: [{
      plan_id: 1,
      plan_content: "图书馆学习",
      plan_star_time: "8:00",
      plan_end_time: "9:00",
      //  是否每日重复
      plan_if_repeat: true,
      //  是否打开微信未完成提示
      plan_if_prompt: true,
      //  提示的时间 当天的时间
      plan_if_prompt_time: "8:30",
      //  是否已完成
      plan_if_finish: true,
      //  用户左滑窗口
      right: 0
    }, {
      plan_id: 2,
      plan_content: "图书馆学习",
      plan_star_time: "8:00",
      plan_end_time: "9:00",
      //  是否每日重复
      plan_if_repeat: true,
      //  是否打开微信未完成提示
      plan_if_prompt: true,
      //  提示的时间
      plan_if_prompt_time: "8:30",
      //  是否已完成
      plan_if_finish: false,
      //  用户左滑窗口
      right: 0
    },
    {
      plan_id: 3,
      plan_content: "图书馆学习",
      plan_star_time: "8:00",
      plan_end_time: "9:00",
      //  是否每日重复
      plan_if_repeat: true,
      //  是否打开微信未完成提示
      plan_if_prompt: true,
      //  提示的时间
      plan_if_prompt_time: "8:30",
      //  是否已完成
      plan_if_finish: false,
      //  用户左滑窗口
      right: 0
    }
  ]
}

module.exports = {
  //everyday_planList: everyday_planList
}