"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_websocket = require("./utils/websocket.js");
const api_api = require("./api/api.js");
const utils_notification = require("./utils/notification.js");
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
  "./pages/club/apply.js";
  "./pages/club/applies.js";
  "./pages/club/members.js";
  "./pages/club/activities.js";
  "./pages/club/editClub.js";
  "./pages/club/topTen.js";
  "./pages/club/manageRecruitment.js";
  "./pages/chat/room.js";
  "./pages/chat/settings.js";
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
    common_vendor.index.__f__("warn", "at App.vue:8", "当前组件仅支持 uni_modules 目录结构 ,请升级 HBuilderX 到 3.1.0 版本以上！");
    common_vendor.index.__f__("log", "at App.vue:9", "【App】应用启动");
    const token = common_vendor.index.getStorageSync("token");
    if (token) {
      common_vendor.index.__f__("log", "at App.vue:14", "【App】检测到用户已登录，Token:", token.substring(0, 20) + "...");
      common_vendor.index.__f__("log", "at App.vue:15", "【App】服务器地址:", api_api.apiModule.baseURL);
      common_vendor.index.__f__("log", "at App.vue:16", "【App】开始建立WebSocket连接");
      utils_websocket.wsClient.connect(api_api.apiModule.baseURL || "http://localhost:8081").then(() => {
        common_vendor.index.__f__("log", "at App.vue:20", "【App】WebSocket连接成功");
      }).catch((error) => {
        common_vendor.index.__f__("error", "at App.vue:23", "【App】WebSocket连接失败:", error);
        common_vendor.index.__f__("error", "at App.vue:24", "【App】错误详情:", JSON.stringify(error));
      });
      this.loadUnreadCountAndUpdateBadge();
    } else {
      common_vendor.index.__f__("log", "at App.vue:30", "【App】用户未登录，跳过WebSocket连接");
    }
    this.registerGlobalNotificationHandlers();
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:37", "【App】应用显示");
    const token = common_vendor.index.getStorageSync("token");
    if (token && utils_websocket.wsClient.isConnected) {
      this.registerGlobalNotificationHandlers();
      this.loadUnreadCountAndUpdateBadge();
    }
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:50", "App Hide");
  },
  methods: {
    /**
     * 加载未读消息数量并更新tabBar红点
     */
    async loadUnreadCountAndUpdateBadge() {
      try {
        common_vendor.index.__f__("log", "at App.vue:58", "【App】开始加载未读消息数量");
        const response = await api_api.apiModule.notification.getUnreadCount();
        if (response.code === 200) {
          const unreadCount = response.data || 0;
          common_vendor.index.__f__("log", "at App.vue:63", "【App】未读消息数量:", unreadCount);
          if (unreadCount > 0) {
            const badgeText = unreadCount > 99 ? "99+" : String(unreadCount);
            common_vendor.index.setTabBarBadge({
              index: 3,
              text: badgeText
            });
            common_vendor.index.__f__("log", "at App.vue:72", "【App】已设置tabBar红点:", badgeText);
          } else {
            common_vendor.index.removeTabBarBadge({ index: 3 });
            common_vendor.index.__f__("log", "at App.vue:75", "【App】已移除tabBar红点");
          }
        } else {
          common_vendor.index.__f__("error", "at App.vue:78", "【App】获取未读消息数量失败:", response.message);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at App.vue:81", "【App】加载未读消息数量异常:", error);
      }
    },
    /**
     * 注册全局消息通知处理器
     */
    registerGlobalNotificationHandlers() {
      common_vendor.index.__f__("log", "at App.vue:89", "【App】开始注册全局通知处理器");
      const handleNotification = (message) => {
        common_vendor.index.__f__("log", "at App.vue:93", "【通知】收到通知消息:", message);
        if (!message.type || !message.title || !message.message) {
          common_vendor.index.__f__("error", "at App.vue:97", "【通知】消息格式不正确，缺少必需字段:", message);
          return;
        }
        utils_notification.showNotification({
          type: message.type.replace("_notification", ""),
          // 移除后缀得到纯类型
          title: message.title,
          message: message.message,
          extraInfo: message.extraInfo || message.feedback || null
        });
        this.updateTabBarBadgeOnNewMessage();
        this.emitNotificationEvent(message);
      };
      const notificationTypes = [
        "activity_cancel_notification",
        // 活动取消通知
        "apply_approved_notification",
        // 活动报名审核通过
        "apply_rejected_notification",
        // 活动报名审核拒绝
        "activity_reminder_notification",
        // 活动提醒
        "check_in_notification",
        // 签到成功通知
        "club_apply_approved_notification",
        // 社团申请审核通过
        "club_apply_rejected_notification",
        // 社团申请审核拒绝
        "club_member_removed_notification",
        // 社团成员被移除
        "club_quit_apply_notification",
        // 退社申请（通知管理员）
        "club_quit_approved_notification",
        // 退社申请通过（通知用户）
        "club_quit_rejected_notification",
        // 退社申请拒绝（通知用户）
        "system_broadcast_notification",
        // 系统广播通知
        "admin_notification_notification"
        // 管理员通知
      ];
      notificationTypes.forEach((type) => {
        utils_websocket.wsClient.onMessageType(type, handleNotification);
        common_vendor.index.__f__("log", "at App.vue:135", `【App】已注册通知类型: ${type}`);
      });
      common_vendor.index.__f__("log", "at App.vue:138", "【App】全局通知处理器注册完成");
    },
    // 触发全局事件（供其他页面监听状态变化）
    emitNotificationEvent(message) {
      const type = message.type;
      if (type === "activity_cancel_notification") {
        common_vendor.index.$emit("activityCancelled", {
          activityId: message.activityId,
          activityTitle: message.activityTitle
        });
      } else if (type === "apply_approved_notification" || type === "apply_rejected_notification") {
        common_vendor.index.$emit("applyStatusChanged", {
          activityId: message.activityId,
          applyId: message.applyId,
          status: type === "apply_approved_notification" ? "approved" : "rejected"
        });
      } else if (type === "club_apply_approved_notification" || type === "club_apply_rejected_notification") {
        common_vendor.index.$emit("clubApplyStatusChanged", {
          clubId: message.clubId,
          clubName: message.clubName,
          applyId: message.applyId,
          status: type === "club_apply_approved_notification" ? "approved" : "rejected"
        });
      } else if (type === "club_member_removed_notification") {
        common_vendor.index.$emit("clubMemberRemoved", {
          clubId: message.clubId,
          clubName: message.clubName
        });
      } else if (type === "club_quit_apply_notification") {
        common_vendor.index.$emit("clubQuitApply", {
          clubId: message.clubId,
          clubName: message.clubName,
          applicantUserId: message.applicantUserId,
          applicantName: message.applicantName
        });
      } else if (type === "club_quit_approved_notification") {
        common_vendor.index.$emit("clubQuitApproved", {
          clubId: message.clubId,
          clubName: message.clubName
        });
      } else if (type === "club_quit_rejected_notification") {
        common_vendor.index.$emit("clubQuitRejected", {
          clubId: message.clubId,
          clubName: message.clubName
        });
      } else if (type === "activity_reminder_notification") {
        common_vendor.index.$emit("activityReminder", {
          activityId: message.activityId,
          activityTitle: message.activityTitle
        });
      } else if (type === "check_in_notification") {
        common_vendor.index.$emit("checkInSuccess", {
          activityId: message.activityId,
          activityTitle: message.activityTitle
        });
      } else if (type === "system_broadcast_notification") {
        common_vendor.index.$emit("systemBroadcast", {
          title: message.title,
          message: message.message
        });
      } else if (type === "admin_notification_notification") {
        common_vendor.index.$emit("adminNotification", {
          title: message.title,
          message: message.message
        });
      }
    },
    // 收到新消息时更新tabBar红点
    updateTabBarBadgeOnNewMessage() {
      try {
        common_vendor.index.getTabBarBadge({
          index: 3,
          success: (res) => {
            let currentCount = 0;
            if (res.text) {
              if (res.text === "99+") {
                return;
              }
              currentCount = parseInt(res.text) || 0;
            }
            const newCount = currentCount + 1;
            const badgeText = newCount > 99 ? "99+" : String(newCount);
            common_vendor.index.setTabBarBadge({
              index: 3,
              text: badgeText
            });
            common_vendor.index.__f__("log", "at App.vue:238", "【TabBar】更新红点数量:", badgeText);
          },
          fail: () => {
            common_vendor.index.setTabBarBadge({
              index: 3,
              text: "1"
            });
            common_vendor.index.__f__("log", "at App.vue:246", "【TabBar】设置红点数量: 1");
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at App.vue:250", "【TabBar】更新红点失败:", error);
      }
    }
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.config.globalProperties.$api = api_api.apiModule;
  app.use(utils_notification.notificationPlugin);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
