"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_websocket = require("./utils/websocket.js");
const api_api = require("./api/api.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/user/user.js";
  "./pages/user/myClubs.js";
  "./pages/user/myActivities.js";
  "./pages/user/myApplies.js";
  "./pages/activity/activity.js";
  "./pages/activity/activityDeatil.js";
  "./pages/activity/edit.js";
  "./pages/map/map.js";
  "./pages/activity/applies.js";
  "./pages/user/login.js";
  "./pages/message/message.js";
  "./pages/notification/notification.js";
  "./pages/club/club.js";
  "./pages/club/detail.js";
  "./pages/club/recruitment.js";
  "./pages/club/createRecruitment.js";
  "./pages/club/editRecruitment.js";
  "./pages/club/apply.js";
  "./pages/club/applies.js";
  "./pages/club/members.js";
  "./pages/club/activities.js";
  "./pages/club/editClub.js";
  "./pages/club/topTen.js";
  "./pages/club/manageRecruitment.js";
  "./pages/chat/room.js";
  "./pages/chat/create.js";
  "./pages/notice/notice.js";
  "./pages/notice/detail.js";
  "./pages/admin/login.js";
  "./pages/admin/index.js";
  "./pages/admin/admins.js";
  "./pages/admin/users.js";
  "./pages/admin/notices.js";
  "./pages/admin/notices/edit.js";
  "./pages/admin/password.js";
  "./pages/admin/clubs.js";
  "./pages/admin/activities.js";
  "./pages/admin/recruitment/configs.js";
  "./pages/admin/recruitment/edit.js";
  "./pages/admin/recruitment/audit.js";
  "./pages/admin/recruitment/detail.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("warn", "at App.vue:7", "当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！");
    common_vendor.index.__f__("log", "at App.vue:8", "App Launch");
    const token = common_vendor.index.getStorageSync("token");
    if (token) {
      common_vendor.index.__f__("log", "at App.vue:13", "【App】检测到用户已登录，建立WebSocket连接");
      utils_websocket.wsClient.connect(api_api.apiModule.baseURL || "http://localhost:8081");
    } else {
      common_vendor.index.__f__("log", "at App.vue:16", "【App】用户未登录，跳过WebSocket连接");
    }
    utils_websocket.wsClient.onMessageType("activity_cancel_notification", (message) => {
      common_vendor.index.__f__("log", "at App.vue:21", "【全局】收到活动取消通知:", message);
      common_vendor.index.showModal({
        title: "活动取消通知",
        content: message.message || `您报名的活动"${message.activityTitle}"已被取消`,
        showCancel: false,
        confirmText: "知道了"
      });
      common_vendor.index.$emit("activityCancelled", {
        activityId: message.activityId,
        activityTitle: message.activityTitle
      });
    });
  },
  onShow: function() {
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:49", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.config.globalProperties.$api = api_api.apiModule;
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
