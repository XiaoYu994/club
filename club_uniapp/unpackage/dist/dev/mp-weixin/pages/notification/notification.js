"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_custom_nav_bar2 + _easycom_uni_icons2)();
}
const _easycom_custom_nav_bar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "notification",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const notifications = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const unreadCount = common_vendor.ref(0);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(20);
    const noMore = common_vendor.ref(false);
    async function loadNotifications(refresh = false) {
      if (loading.value)
        return;
      if (refresh) {
        page.value = 1;
        noMore.value = false;
        notifications.value = [];
      }
      loading.value = true;
      common_vendor.index.__f__("log", "at pages/notification/notification.vue:95", "【通知】开始加载消息通知，page:", page.value, "size:", pageSize.value);
      try {
        const response = await proxy.$api.notification.getNotifications({
          page: page.value,
          size: pageSize.value
        });
        common_vendor.index.__f__("log", "at pages/notification/notification.vue:103", "【通知】接口返回:", response);
        if (response.code === 200) {
          const newData = response.data.list || [];
          common_vendor.index.__f__("log", "at pages/notification/notification.vue:107", "【通知】获取到数据条数:", newData.length, "数据:", newData);
          if (refresh) {
            notifications.value = newData;
          } else {
            notifications.value = [...notifications.value, ...newData];
          }
          if (newData.length < pageSize.value) {
            noMore.value = true;
          }
          if (newData.length > 0) {
            page.value++;
          }
        } else {
          common_vendor.index.__f__("error", "at pages/notification/notification.vue:125", "【通知】接口返回错误:", response.message);
          common_vendor.index.showToast({ title: response.message || "获取消息失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/notification/notification.vue:129", "【通知】获取消息通知失败:", error);
        common_vendor.index.showToast({ title: "网络异常，请稍后重试", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    async function loadUnreadCount() {
      try {
        const response = await proxy.$api.notification.getUnreadCount();
        if (response.code === 200) {
          unreadCount.value = response.data || 0;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/notification/notification.vue:144", "获取未读数量失败:", error);
      }
    }
    function loadMore() {
      if (!noMore.value && !loading.value) {
        loadNotifications(false);
      }
    }
    async function handleNotificationClick(notification) {
      if (notification.isRead === 0) {
        try {
          await proxy.$api.notification.markAsRead(notification.id);
          notification.isRead = 1;
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/notification/notification.vue:164", "标记已读失败:", error);
        }
      }
      if (notification.type === "activity_cancel" && notification.relatedId) {
        common_vendor.index.navigateTo({
          url: `/pages/activity/activityDeatil?id=${notification.relatedId}`
        });
      } else if (notification.type === "check_in" && notification.relatedId) {
        common_vendor.index.navigateTo({
          url: `/pages/activity/activityDeatil?id=${notification.relatedId}`
        });
      }
    }
    function handleMarkAllRead() {
      common_vendor.index.showModal({
        title: "确认操作",
        content: "确定要将所有消息标记为已读吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "处理中..." });
              const response = await proxy.$api.notification.markAllAsRead();
              if (response.code === 200) {
                notifications.value.forEach((item) => {
                  item.isRead = 1;
                });
                unreadCount.value = 0;
                common_vendor.index.showToast({ title: "已全部标记为已读", icon: "success" });
              } else {
                common_vendor.index.showToast({ title: response.message || "操作失败", icon: "none" });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/notification/notification.vue:203", "标记全部已读失败:", error);
              common_vendor.index.showToast({ title: "网络异常，请稍后重试", icon: "none" });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    }
    function handleDelete(notification) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这条消息吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await proxy.$api.notification.deleteNotification(notification.id);
              if (response.code === 200) {
                const index = notifications.value.findIndex((item) => item.id === notification.id);
                if (index !== -1) {
                  notifications.value.splice(index, 1);
                }
                if (notification.isRead === 0) {
                  unreadCount.value = Math.max(0, unreadCount.value - 1);
                }
                common_vendor.index.showToast({ title: "删除成功", icon: "success" });
              } else {
                common_vendor.index.showToast({ title: response.message || "删除失败", icon: "none" });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/notification/notification.vue:240", "删除消息失败:", error);
              common_vendor.index.showToast({ title: "网络异常，请稍后重试", icon: "none" });
            }
          }
        }
      });
    }
    function getTypeIcon(type) {
      const iconMap = {
        "activity_cancel": "closeempty",
        "check_in": "checkmarkempty",
        "apply_review": "chatboxes"
      };
      return iconMap[type] || "notification";
    }
    function getTypeClass(type) {
      const classMap = {
        "activity_cancel": "type-cancel",
        "check_in": "type-success",
        "apply_review": "type-info"
      };
      return classMap[type] || "type-default";
    }
    function formatTime(timestamp) {
      if (!timestamp)
        return "";
      const time = typeof timestamp === "string" ? Number(timestamp) : timestamp;
      if (isNaN(time)) {
        common_vendor.index.__f__("error", "at pages/notification/notification.vue:276", "【通知】时间格式错误:", timestamp);
        return "";
      }
      const date = new Date(time);
      const now = /* @__PURE__ */ new Date();
      if (date.toDateString() === now.toDateString()) {
        const hours2 = date.getHours().toString().padStart(2, "0");
        const minutes2 = date.getMinutes().toString().padStart(2, "0");
        return `今天 ${hours2}:${minutes2}`;
      }
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        const hours2 = date.getHours().toString().padStart(2, "0");
        const minutes2 = date.getMinutes().toString().padStart(2, "0");
        return `昨天 ${hours2}:${minutes2}`;
      }
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      if (date > oneWeekAgo) {
        const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        const hours2 = date.getHours().toString().padStart(2, "0");
        const minutes2 = date.getMinutes().toString().padStart(2, "0");
        return `${days[date.getDay()]} ${hours2}:${minutes2}`;
      }
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${month}-${day} ${hours}:${minutes}`;
    }
    common_vendor.onMounted(() => {
      loadNotifications(true);
      loadUnreadCount();
    });
    common_vendor.onShow(() => {
      loadNotifications(true);
      loadUnreadCount();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: unreadCount.value > 0
      }, unreadCount.value > 0 ? {
        b: common_vendor.o(handleMarkAllRead)
      } : {}, {
        c: common_vendor.p({
          title: "消息通知",
          background: "#fff",
          ["title-color"]: "#333"
        }),
        d: common_vendor.f(notifications.value, (notification, idx, i0) => {
          return common_vendor.e({
            a: notification.isRead === 0
          }, notification.isRead === 0 ? {} : {}, {
            b: "7956d0c3-1-" + i0,
            c: common_vendor.p({
              type: getTypeIcon(notification.type),
              size: "24",
              color: "#fff"
            }),
            d: common_vendor.n(getTypeClass(notification.type)),
            e: common_vendor.t(notification.title),
            f: common_vendor.t(notification.message),
            g: common_vendor.t(formatTime(notification.createTime)),
            h: "7956d0c3-2-" + i0,
            i: common_vendor.o(($event) => handleDelete(notification), notification.id),
            j: notification.id,
            k: notification.isRead === 0 ? 1 : "",
            l: common_vendor.o(($event) => handleNotificationClick(notification), notification.id)
          });
        }),
        e: common_vendor.p({
          type: "trash",
          size: "18",
          color: "#999"
        }),
        f: loading.value
      }, loading.value ? {
        g: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#999"
        })
      } : {}, {
        h: noMore.value && notifications.value.length > 0
      }, noMore.value && notifications.value.length > 0 ? {} : {}, {
        i: notifications.value.length === 0 && !loading.value
      }, notifications.value.length === 0 && !loading.value ? {
        j: common_assets._imports_0$5
      } : {}, {
        k: common_vendor.o(loadMore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7956d0c3"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/notification/notification.js.map
