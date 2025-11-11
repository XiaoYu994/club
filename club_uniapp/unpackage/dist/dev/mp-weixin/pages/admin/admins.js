"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_common = require("../../utils/common.js");
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
  __name: "admins",
  setup(__props) {
    const currentAdminId = common_vendor.ref(null);
    const searchParams = common_vendor.reactive({
      keyword: "",
      status: "",
      pageNo: 1,
      pageSize: 10
    });
    const adminList = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const page = common_vendor.ref(1);
    const refresherTriggered = common_vendor.ref(false);
    const addAdminPopup = common_vendor.ref(null);
    const newAdmin = common_vendor.reactive({
      username: "",
      password: "",
      phone: "",
      description: "",
      type: 0
      // 默认普通管理员
    });
    const handleSearch = () => {
      page.value = 1;
      adminList.value = [];
      hasMore.value = true;
      loadAdminList();
    };
    const setStatusFilter = (status) => {
      searchParams.status = status;
      handleSearch();
    };
    const loadAdminList = async () => {
      if (loading.value)
        return;
      loading.value = true;
      try {
        const params = {
          ...searchParams,
          page: page.value
        };
        const response = await api_api.apiModule.admin.admin.getAdmins(params);
        if (response.code === 200) {
          const { list, total } = response.data;
          if (page.value === 1) {
            adminList.value = list || [];
          } else {
            adminList.value = [...adminList.value, ...list || []];
          }
          hasMore.value = adminList.value.length < total;
        } else {
          common_vendor.index.showToast({
            title: response.message || "获取管理员列表失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/admins.vue:237", "获取管理员列表失败:", error);
        common_vendor.index.showToast({
          title: "获取管理员列表失败",
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
      loadAdminList();
    };
    const onRefresh = () => {
      refresherTriggered.value = true;
      page.value = 1;
      adminList.value = [];
      hasMore.value = true;
      loadAdminList();
    };
    const viewAdminDetail = (id) => {
    };
    const toggleAdminStatus = (admin) => {
      const newStatus = admin.status ? 0 : 1;
      const action = newStatus ? "启用" : "禁用";
      common_vendor.index.showModal({
        title: "提示",
        content: `确定要${action}该管理员吗？`,
        success: async function(res) {
          if (res.confirm) {
            try {
              const response = await api_api.apiModule.admin.admin.updateAdminStatus({
                adminId: admin.id,
                status: newStatus
              });
              if (response.code === 200) {
                common_vendor.index.showToast({
                  title: `${action}成功`,
                  icon: "success"
                });
                const index = adminList.value.findIndex((item) => item.id === admin.id);
                if (index !== -1) {
                  adminList.value[index].status = newStatus;
                }
              } else {
                common_vendor.index.showToast({
                  title: response.message || `${action}失败`,
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/admin/admins.vue:311", `${action}管理员失败:`, error);
              common_vendor.index.showToast({
                title: `${action}失败，请重试`,
                icon: "none"
              });
            }
          }
        }
      });
    };
    const resetPassword = (admin) => {
      common_vendor.index.showModal({
        title: "提示",
        content: `确定要重置${admin.username}的密码吗？`,
        success: async function(res) {
          if (res.confirm) {
            try {
              const response = await api_api.apiModule.admin.admin.resetAdminPassword(admin.id);
              if (response.code === 200) {
                common_vendor.index.showToast({
                  title: "重置密码成功",
                  icon: "success"
                });
              } else {
                common_vendor.index.showToast({
                  title: response.message || "重置密码失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/admin/admins.vue:346", "重置密码失败:", error);
              common_vendor.index.showToast({
                title: "重置密码失败，请重试",
                icon: "none"
              });
            }
          }
        }
      });
    };
    const showAddAdminModal = () => {
      Object.assign(newAdmin, {
        username: "",
        password: "",
        phone: "",
        description: "",
        type: 0
      });
      addAdminPopup.value.open();
    };
    const closeAddAdminPopup = () => {
      addAdminPopup.value.close();
    };
    const addAdmin = async () => {
      if (!newAdmin.username || !newAdmin.password) {
        common_vendor.index.showToast({
          title: "账号和密码不能为空",
          icon: "none"
        });
        return;
      }
      try {
        const response = await api_api.apiModule.admin.admin.createAdmin(newAdmin);
        if (response.code === 200) {
          common_vendor.index.showToast({
            title: "添加管理员成功",
            icon: "success"
          });
          closeAddAdminPopup();
          handleSearch();
        } else {
          common_vendor.index.showToast({
            title: response.message || "添加管理员失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/admins.vue:408", "添加管理员失败:", error);
        common_vendor.index.showToast({
          title: "添加管理员失败，请重试",
          icon: "none"
        });
      }
    };
    const adminTypeChange = (e) => {
      newAdmin.type = parseInt(e.detail.value);
    };
    const confirmDeleteAdmin = (admin) => {
      common_vendor.index.showModal({
        title: "删除确认",
        content: `确定要删除管理员 ${admin.username} 吗？此操作不可恢复！`,
        success: async (res) => {
          if (res.confirm) {
            deleteAdmin(admin);
          }
        }
      });
    };
    const deleteAdmin = async (admin) => {
      try {
        common_vendor.index.showLoading({ title: "删除中..." });
        const response = await api_api.apiModule.admin.admin.deleteAdmin(admin.id);
        if (response.code === 200) {
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
          const index = adminList.value.findIndex((item) => item.id === admin.id);
          if (index !== -1) {
            adminList.value.splice(index, 1);
          }
        } else {
          common_vendor.index.showToast({
            title: response.message || "删除失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/admins.vue:463", "删除管理员失败:", error);
        common_vendor.index.showToast({
          title: "删除失败，请重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    common_vendor.onMounted(() => {
      const token = common_vendor.index.getStorageSync("adminToken");
      if (!token) {
        common_vendor.index.reLaunch({ url: "/pages/admin/login" });
        return;
      }
      const adminInfo = common_vendor.index.getStorageSync("adminInfo");
      if (!adminInfo || adminInfo.type !== 1) {
        common_vendor.index.showToast({
          title: "无权限访问",
          icon: "none"
        });
        common_vendor.index.navigateBack();
        return;
      }
      currentAdminId.value = adminInfo.id;
      loadAdminList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "管理员管理"
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
        g: common_vendor.o(showAddAdminModal),
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
        p: common_vendor.f(adminList.value, (item, k0, i0) => {
          return common_vendor.e({
            a: "9ee9429e-3-" + i0,
            b: common_vendor.t(item.username),
            c: common_vendor.t(item.status ? "正常" : "已禁用"),
            d: common_vendor.n(item.status ? "normal" : "disabled"),
            e: item.type === 1
          }, item.type === 1 ? {} : {}, {
            f: common_vendor.t(item.phone || "未绑定手机"),
            g: common_vendor.t(common_vendor.unref(utils_common.formatDate)(item.createTime)),
            h: common_vendor.o(($event) => viewAdminDetail(item.id), item.id),
            i: item.id !== currentAdminId.value && item.type !== 1
          }, item.id !== currentAdminId.value && item.type !== 1 ? {
            j: common_vendor.t(item.status ? "禁用" : "启用"),
            k: common_vendor.n(item.status ? "disable-btn" : "enable-btn"),
            l: common_vendor.o(($event) => toggleAdminStatus(item), item.id)
          } : {}, {
            m: item.id !== currentAdminId.value && item.type !== 1
          }, item.id !== currentAdminId.value && item.type !== 1 ? {
            n: common_vendor.o(($event) => resetPassword(item), item.id)
          } : {}, {
            o: item.id !== currentAdminId.value && item.type !== 1
          }, item.id !== currentAdminId.value && item.type !== 1 ? {
            p: common_vendor.o(($event) => confirmDeleteAdmin(item), item.id)
          } : {}, {
            q: item.id
          });
        }),
        q: common_vendor.p({
          type: "staff",
          size: "30",
          color: "#2979ff"
        }),
        r: adminList.value.length === 0
      }, adminList.value.length === 0 ? {
        s: common_vendor.p({
          type: "info",
          size: "40",
          color: "#999"
        })
      } : {}, {
        t: loading.value && page.value > 1
      }, loading.value && page.value > 1 ? {} : {}, {
        v: !loading.value && !hasMore.value && adminList.value.length > 0
      }, !loading.value && !hasMore.value && adminList.value.length > 0 ? {} : {}), {
        w: common_vendor.o(loadMore),
        x: refresherTriggered.value,
        y: common_vendor.o(onRefresh),
        z: newAdmin.username,
        A: common_vendor.o(($event) => newAdmin.username = $event.detail.value),
        B: newAdmin.password,
        C: common_vendor.o(($event) => newAdmin.password = $event.detail.value),
        D: newAdmin.phone,
        E: common_vendor.o(($event) => newAdmin.phone = $event.detail.value),
        F: newAdmin.description,
        G: common_vendor.o(($event) => newAdmin.description = $event.detail.value),
        H: newAdmin.type === 0,
        I: newAdmin.type === 1,
        J: common_vendor.o(adminTypeChange),
        K: common_vendor.o(closeAddAdminPopup),
        L: common_vendor.o(addAdmin),
        M: common_vendor.sr(addAdminPopup, "9ee9429e-5", {
          "k": "addAdminPopup"
        }),
        N: common_vendor.p({
          type: "center"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9ee9429e"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/admins.js.map
