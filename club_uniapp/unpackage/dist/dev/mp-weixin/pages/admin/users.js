"use strict";
const common_vendor = require("../../common/vendor.js");
const api_api = require("../../api/api.js");
const utils_common = require("../../utils/common.js");
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
  __name: "users",
  setup(__props) {
    const searchParams = common_vendor.reactive({
      keyword: "",
      status: "",
      page: 1,
      pageSize: 10
    });
    const userList = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const page = common_vendor.ref(1);
    const refresherTriggered = common_vendor.ref(false);
    const handleSearch = () => {
      page.value = 1;
      userList.value = [];
      hasMore.value = true;
      loadUserList();
    };
    const setStatusFilter = (status) => {
      searchParams.status = status;
      handleSearch();
    };
    const loadUserList = async () => {
      if (loading.value)
        return;
      loading.value = true;
      try {
        const params = {
          ...searchParams,
          page: page.value
        };
        const response = await api_api.apiModule.admin.user.getUsers(params);
        if (response.code === 200) {
          const { list, total, pageNum, pageSize } = response.data;
          if (page.value === 1) {
            userList.value = list || [];
          } else {
            userList.value = [...userList.value, ...list || []];
          }
          hasMore.value = userList.value.length < total;
        } else {
          common_vendor.index.showToast({
            title: response.message || "获取用户列表失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/users.vue:177", "获取用户列表失败:", error);
        common_vendor.index.showToast({
          title: "获取用户列表失败",
          icon: "none"
        });
      } finally {
        loading.value = false;
        refresherTriggered.value = false;
      }
    };
    const loadMore = () => {
      if (loading.value || !hasMore.value)
        return;
      page.value++;
      loadUserList();
    };
    const onRefresh = () => {
      refresherTriggered.value = true;
      page.value = 1;
      userList.value = [];
      hasMore.value = true;
      loadUserList();
    };
    const toggleUserStatus = (user) => {
      const newStatus = user.status ? 0 : 1;
      const action = newStatus ? "启用" : "禁用";
      common_vendor.index.showModal({
        title: "提示",
        content: `确定要${action}该用户吗？`,
        success: async function(res) {
          if (res.confirm) {
            try {
              const response = await api_api.apiModule.admin.user.updateUserStatus(user.id, {
                status: newStatus
              });
              if (response.code === 200) {
                common_vendor.index.showToast({
                  title: `${action}成功`,
                  icon: "success"
                });
                const index = userList.value.findIndex((item) => item.id === user.id);
                if (index !== -1) {
                  userList.value[index].status = newStatus;
                }
              } else {
                common_vendor.index.showToast({
                  title: response.message || `${action}失败`,
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/admin/users.vue:244", `${action}用户失败:`, error);
              common_vendor.index.showToast({
                title: `${action}失败，请重试`,
                icon: "none"
              });
            }
          }
        }
      });
    };
    const exportAllUsers = async () => {
      if (loading.value)
        return;
      common_vendor.index.showLoading({ title: "正在导出..." });
      try {
        const params = { ...searchParams, page: 1 };
        const response = await api_api.apiModule.admin.user.exportUsers(params);
        common_vendor.index.hideLoading();
        if (response.code === 200) {
          const { url, fileName } = response.data;
          common_vendor.index.downloadFile({
            url,
            success: (res) => {
              common_vendor.index.saveFile({ tempFilePath: res.tempFilePath, success: (saveRes) => {
                common_vendor.index.openDocument({ filePath: saveRes.savedFilePath });
              } });
            },
            fail: () => common_vendor.index.showToast({ title: "下载失败", icon: "none" })
          });
        } else {
          common_vendor.index.showToast({ title: response.message || "导出失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "导出失败", icon: "none" });
        common_vendor.index.__f__("error", "at pages/admin/users.vue:290", "导出用户失败", error);
      }
    };
    common_vendor.onMounted(() => {
      const token = common_vendor.index.getStorageSync("adminToken");
      if (!token) {
        common_vendor.index.reLaunch({
          url: "/pages/admin/login"
        });
        return;
      }
      loadUserList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "用户管理"
        }),
        b: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        c: common_vendor.o(handleSearch),
        d: searchParams.keyword,
        e: common_vendor.o(($event) => searchParams.keyword = $event.detail.value),
        f: common_vendor.o(handleSearch),
        g: common_vendor.o(exportAllUsers),
        h: searchParams.status === "" ? 1 : "",
        i: common_vendor.o(($event) => setStatusFilter("")),
        j: searchParams.status === 1 ? 1 : "",
        k: common_vendor.o(($event) => setStatusFilter(1)),
        l: searchParams.status === 0 ? 1 : "",
        m: common_vendor.o(($event) => setStatusFilter(0)),
        n: loading.value && page.value === 1
      }, loading.value && page.value === 1 ? {
        o: common_vendor.p({
          type: "spinner-cycle",
          size: "24",
          color: "#999"
        })
      } : common_vendor.e({
        p: common_vendor.f(userList.value, (item, k0, i0) => {
          return {
            a: item.avatar || "/static/images/avatar-default.png",
            b: common_vendor.t(item.username || "未设置昵称"),
            c: common_vendor.t(item.status ? "正常" : "已禁用"),
            d: common_vendor.n(item.status ? "normal" : "disabled"),
            e: common_vendor.t(item.mobile || "未绑定手机"),
            f: common_vendor.t(item.studentId || "暂无学号"),
            g: common_vendor.t(item.className || "暂无班级"),
            h: common_vendor.t(item.major || "暂无专业"),
            i: common_vendor.t(common_vendor.unref(utils_common.formatDate)(item.createTime)),
            j: common_vendor.t(item.status ? "禁用" : "启用"),
            k: common_vendor.n(item.status ? "disable-btn" : "enable-btn"),
            l: common_vendor.o(($event) => toggleUserStatus(item), item.id),
            m: item.id
          };
        }),
        q: userList.value.length === 0
      }, userList.value.length === 0 ? {
        r: common_vendor.p({
          type: "info",
          size: "40",
          color: "#999"
        })
      } : {}, {
        s: loading.value && page.value > 1
      }, loading.value && page.value > 1 ? {} : {}, {
        t: !loading.value && !hasMore.value && userList.value.length > 0
      }, !loading.value && !hasMore.value && userList.value.length > 0 ? {} : {}), {
        v: common_vendor.o(loadMore),
        w: refresherTriggered.value,
        x: common_vendor.o(onRefresh)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a139a655"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/users.js.map
