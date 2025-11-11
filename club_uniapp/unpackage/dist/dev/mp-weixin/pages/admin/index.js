"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_custom_nav_bar2 + _easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_custom_nav_bar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const statistics = common_vendor.reactive({
      userCount: 0,
      clubCount: 0,
      activityCount: 0,
      noticeCount: 0
    });
    const notices = common_vendor.ref([]);
    const isSuper = common_vendor.ref(false);
    const isInitialLoadDone = common_vendor.ref(false);
    const adminMenuPopup = common_vendor.ref(null);
    const loadStatistics = async () => {
      try {
        const response = await api_api.apiModule.admin.getStatistics();
        if (response.code === 200) {
          Object.assign(statistics, response.data);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/index.vue:175", "获取统计数据失败:", error);
      }
    };
    const loadRecentNotices = async () => {
      try {
        const response = await api_api.apiModule.admin.getRecentNotices();
        if (response.code === 200) {
          notices.value = response.data || [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/index.vue:189", "获取最近公告失败:", error);
      }
    };
    const navigateTo = (url) => {
      common_vendor.index.navigateTo({ url });
    };
    const closeAdminMenu = () => {
      adminMenuPopup.value.close();
    };
    const modifyPassword = () => {
      closeAdminMenu();
      navigateTo("/pages/admin/password");
    };
    const confirmLogout = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确认退出登录？",
        success: function(res) {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("adminToken");
            common_vendor.index.removeStorageSync("adminInfo");
            common_vendor.index.reLaunch({
              url: "/pages/admin/login"
            });
          }
        }
      });
    };
    const formatDate = (timestamp) => {
      if (!timestamp)
        return "";
      const time = parseInt(timestamp);
      if (isNaN(time))
        return "";
      const d = new Date(time);
      if (isNaN(d.getTime()))
        return "";
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const day = d.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    common_vendor.onMounted(() => {
      const token = common_vendor.index.getStorageSync("adminToken");
      if (!token) {
        common_vendor.index.reLaunch({
          url: "/pages/admin/login"
        });
        return;
      }
      const adminInfo = common_vendor.index.getStorageSync("adminInfo");
      if (adminInfo && adminInfo.type === 1) {
        isSuper.value = true;
      }
      loadStatistics();
      loadRecentNotices();
      isInitialLoadDone.value = true;
    });
    common_vendor.onShow(() => {
      if (isInitialLoadDone.value) {
        loadStatistics();
        loadRecentNotices();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "系统管理控制台"
        }),
        b: common_vendor.t(statistics.userCount || 0),
        c: common_vendor.p({
          type: "person",
          size: "22",
          color: "#2979ff"
        }),
        d: common_vendor.o(($event) => navigateTo("/pages/admin/users")),
        e: common_vendor.t(statistics.clubCount || 0),
        f: common_vendor.p({
          type: "flag",
          size: "22",
          color: "#2979ff"
        }),
        g: common_vendor.o(($event) => navigateTo("/pages/admin/clubs")),
        h: common_vendor.t(statistics.activityCount || 0),
        i: common_vendor.p({
          type: "calendar",
          size: "22",
          color: "#2979ff"
        }),
        j: common_vendor.o(($event) => navigateTo("/pages/admin/activities")),
        k: common_vendor.t(statistics.noticeCount || 0),
        l: common_vendor.p({
          type: "notification",
          size: "22",
          color: "#2979ff"
        }),
        m: common_vendor.o(($event) => navigateTo("/pages/admin/notices")),
        n: common_vendor.p({
          type: "personadd",
          size: "38",
          color: "#2979ff"
        }),
        o: common_vendor.o(($event) => navigateTo("/pages/admin/users")),
        p: common_vendor.p({
          type: "flag",
          size: "38",
          color: "#2979ff"
        }),
        q: common_vendor.o(($event) => navigateTo("/pages/admin/clubs")),
        r: common_vendor.p({
          type: "calendar",
          size: "38",
          color: "#2979ff"
        }),
        s: common_vendor.o(($event) => navigateTo("/pages/admin/activities")),
        t: common_vendor.p({
          type: "notification",
          size: "38",
          color: "#2979ff"
        }),
        v: common_vendor.o(($event) => navigateTo("/pages/admin/notices")),
        w: common_vendor.p({
          type: "paperplane",
          size: "38",
          color: "#2979ff"
        }),
        x: common_vendor.o(($event) => navigateTo("/pages/admin/recruitment/configs")),
        y: common_vendor.p({
          type: "checkmarkempty",
          size: "38",
          color: "#2979ff"
        }),
        z: common_vendor.o(($event) => navigateTo("/pages/admin/recruitment/audit")),
        A: isSuper.value
      }, isSuper.value ? {
        B: common_vendor.p({
          type: "staff",
          size: "38",
          color: "#2979ff"
        }),
        C: common_vendor.o(($event) => navigateTo("/pages/admin/admins"))
      } : {}, {
        D: common_vendor.p({
          type: "locked",
          size: "38",
          color: "#2979ff"
        }),
        E: common_vendor.o(($event) => navigateTo("/pages/admin/password")),
        F: common_vendor.p({
          type: "close",
          size: "38",
          color: "#2979ff"
        }),
        G: common_vendor.o(confirmLogout),
        H: notices.value.length > 0
      }, notices.value.length > 0 ? {
        I: common_vendor.f(notices.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.title),
            b: common_vendor.t(formatDate(item.createTime)),
            c: index
          };
        })
      } : {}, {
        J: common_vendor.p({
          type: "locked",
          size: "20",
          color: "#666"
        }),
        K: common_vendor.o(modifyPassword),
        L: common_vendor.p({
          type: "poweroff",
          size: "20",
          color: "#666"
        }),
        M: common_vendor.o((...args) => _ctx.handleLogout && _ctx.handleLogout(...args)),
        N: common_vendor.o(closeAdminMenu),
        O: common_vendor.sr(adminMenuPopup, "9a704506-14", {
          "k": "adminMenuPopup"
        }),
        P: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9a704506"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/index.js.map
