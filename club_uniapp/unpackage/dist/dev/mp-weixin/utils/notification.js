"use strict";
const common_vendor = require("../common/vendor.js");
let notificationQueue = [];
let isShowing = false;
function showNotification(options = {}) {
  common_vendor.index.__f__("log", "at utils/notification.js:20", "【通知】showNotification 被调用，参数:", options);
  const {
    type = "default",
    title,
    message,
    extraInfo,
    onConfirm,
    onCancel
  } = options;
  const notificationConfig = {
    activity_cancel: {
      icon: "info-filled",
      color: "#ff6b6b",
      defaultTitle: "活动取消通知"
    },
    check_in: {
      icon: "checkmarkempty",
      color: "#51cf66",
      defaultTitle: "签到成功"
    },
    apply_approved: {
      icon: "checkmarkempty",
      color: "#51cf66",
      defaultTitle: "报名审核通过"
    },
    apply_rejected: {
      icon: "closeempty",
      color: "#ff6b6b",
      defaultTitle: "报名审核未通过"
    },
    club_apply_approved: {
      icon: "checkmarkempty",
      color: "#51cf66",
      defaultTitle: "社团申请通过"
    },
    club_apply_rejected: {
      icon: "closeempty",
      color: "#ff6b6b",
      defaultTitle: "社团申请未通过"
    },
    activity_reminder: {
      icon: "calendar-filled",
      color: "#ff9800",
      defaultTitle: "活动提醒"
    },
    default: {
      icon: "notification-filled",
      color: "#3b82f6",
      defaultTitle: "系统通知"
    }
  };
  const config = notificationConfig[type] || notificationConfig.default;
  const finalTitle = title || config.defaultTitle;
  let content = message || "";
  if (extraInfo) {
    content += "\n\n" + extraInfo;
  }
  common_vendor.index.__f__("log", "at utils/notification.js:84", "【通知】准备显示消息，标题:", finalTitle, "内容:", content);
  notificationQueue.push({
    title: finalTitle,
    content,
    onConfirm,
    onCancel
  });
  common_vendor.index.__f__("log", "at utils/notification.js:94", "【通知】当前队列长度:", notificationQueue.length, "是否正在显示:", isShowing);
  if (!isShowing) {
    showNextNotification();
  }
}
function showNextNotification() {
  if (notificationQueue.length === 0) {
    common_vendor.index.__f__("log", "at utils/notification.js:107", "【通知】队列为空，停止显示");
    isShowing = false;
    return;
  }
  isShowing = true;
  const notification = notificationQueue.shift();
  common_vendor.index.__f__("log", "at utils/notification.js:115", "【通知】开始显示消息:", notification.title);
  try {
    common_vendor.index.showModal({
      title: notification.title,
      content: notification.content,
      showCancel: false,
      confirmText: "知道了",
      success: (res) => {
        common_vendor.index.__f__("log", "at utils/notification.js:124", "【通知】用户点击了确认按钮");
        if (res.confirm && notification.onConfirm) {
          notification.onConfirm();
        }
        setTimeout(() => {
          showNextNotification();
        }, 300);
      },
      fail: (err) => {
        common_vendor.index.__f__("error", "at utils/notification.js:134", "【通知】显示失败:", err);
        setTimeout(() => {
          showNextNotification();
        }, 300);
      }
    });
  } catch (error) {
    common_vendor.index.__f__("error", "at utils/notification.js:142", "【通知】showModal 异常:", error);
    setTimeout(() => {
      showNextNotification();
    }, 300);
  }
}
function install(app) {
  common_vendor.index.__f__("log", "at utils/notification.js:155", "【通知】正在安装通知插件...");
  if (app.config && app.config.globalProperties) {
    app.config.globalProperties.$showNotification = showNotification;
    common_vendor.index.__f__("log", "at utils/notification.js:160", "【通知】已注册到 Vue3 globalProperties");
  } else if (app.prototype) {
    app.prototype.$showNotification = showNotification;
    common_vendor.index.__f__("log", "at utils/notification.js:165", "【通知】已注册到 Vue2 prototype");
  }
  if (typeof common_vendor.index !== "undefined") {
    common_vendor.index.$showNotification = showNotification;
    common_vendor.index.__f__("log", "at utils/notification.js:171", "【通知】已注册到 uni 全局对象");
  }
}
const notificationPlugin = {
  install,
  showNotification
};
exports.notificationPlugin = notificationPlugin;
exports.showNotification = showNotification;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/notification.js.map
