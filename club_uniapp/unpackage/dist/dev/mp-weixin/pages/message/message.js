"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_api = require("../../api/api.js");
const utils_auth = require("../../utils/auth.js");
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
  __name: "message",
  setup(__props) {
    const userInfo = utils_auth.getUser();
    const isAdmin = common_vendor.ref(userInfo ? userInfo.isAdmin : false);
    const chatGroups = common_vendor.ref([]);
    const chatLoading = common_vendor.ref(false);
    async function loadChatGroups() {
      chatLoading.value = true;
      try {
        const response = await api_api.chatAPI.getGroups();
        if (response.code === 200) {
          chatGroups.value = response.data.map((group) => ({
            id: group.id,
            name: group.name,
            avatar: group.avatar || "/static/images/group-default.png",
            lastMessage: group.lastMessage || "",
            lastTime: group.lastMessageTime != null ? Number(group.lastMessageTime) : null,
            unread: group.unreadCount || 0
          }));
        } else {
          common_vendor.index.showToast({ title: response.msg || "获取群组失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/message/message.vue:77", "获取聊天群组数据失败:", error);
      } finally {
        chatLoading.value = false;
      }
    }
    common_vendor.onMounted(loadChatGroups);
    common_vendor.onShow(loadChatGroups);
    const enterChatRoom = (chat) => {
      common_vendor.index.navigateTo({
        url: `/pages/chat/room?id=${chat.id}&name=${encodeURIComponent(chat.name)}`
      });
    };
    const createChatGroup = () => {
      common_vendor.index.navigateTo({ url: "/pages/chat/create" });
    };
    function formatTime(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const now = /* @__PURE__ */ new Date();
      if (date.toDateString() === now.toDateString()) {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
      }
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return "昨天";
      }
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      if (date > oneWeekAgo) {
        const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        return days[date.getDay()];
      }
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "群聊",
          background: "#fff",
          ["title-color"]: "#333"
        }),
        b: common_vendor.f(chatGroups.value, (chat, idx, i0) => {
          return {
            a: chat.avatar || "/static/images/group-default.png",
            b: common_vendor.t(chat.name),
            c: common_vendor.t(chat.lastMessage || "暂无消息"),
            d: common_vendor.t(formatTime(chat.lastTime)),
            e: idx,
            f: common_vendor.o(($event) => enterChatRoom(chat), idx)
          };
        }),
        c: chatGroups.value.length === 0
      }, chatGroups.value.length === 0 ? {
        d: common_assets._imports_0$4
      } : {}, {
        e: isAdmin.value
      }, isAdmin.value ? {
        f: common_vendor.p({
          type: "plus",
          size: "24",
          color: "#fff"
        }),
        g: common_vendor.o(createChatGroup)
      } : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/message/message.js.map
