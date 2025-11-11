"use strict";
const common_vendor = require("../../../common/vendor.js");
const api_api = require("../../../api/api.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup_dialog2 = common_vendor.resolveComponent("uni-popup-dialog");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_custom_nav_bar2 + _easycom_uni_icons2 + _easycom_uni_popup_dialog2 + _easycom_uni_popup2)();
}
const _easycom_custom_nav_bar = () => "../../../components/custom-nav-bar/custom-nav-bar.js";
const _easycom_uni_icons = () => "../../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup_dialog = () => "../../../uni_modules/uni-popup/components/uni-popup-dialog/uni-popup-dialog.js";
const _easycom_uni_popup = () => "../../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_custom_nav_bar + _easycom_uni_icons + _easycom_uni_popup_dialog + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "configs",
  setup(__props) {
    const configList = common_vendor.ref([]);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const total = common_vendor.ref(0);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const searchKeyword = common_vendor.ref("");
    const refresherTriggered = common_vendor.ref(false);
    const selectedConfig = common_vendor.ref(null);
    const deletePopup = common_vendor.ref(null);
    const loadConfigList = async (reset = false) => {
      if (reset) {
        currentPage.value = 1;
        configList.value = [];
        hasMore.value = true;
      }
      if (!hasMore.value || isLoading.value)
        return;
      isLoading.value = true;
      try {
        const params = {
          pageNo: currentPage.value,
          pageSize: pageSize.value,
          keyword: searchKeyword.value
        };
        const response = await api_api.apiModule.admin.recruitment.getConfigPage(params);
        if (response.code === 200) {
          const records = Array.isArray(response.data.list) ? response.data.list : [];
          const totalCount = Number(response.data.total) || 0;
          const current = Number(params.pageNo || 1);
          if (reset) {
            configList.value = records;
          } else {
            configList.value = [...configList.value, ...records];
          }
          total.value = totalCount;
          hasMore.value = configList.value.length < total.value;
          currentPage.value = current + 1;
        } else {
          common_vendor.index.showToast({
            title: response.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/recruitment/configs.vue:138", "加载招新配置列表失败:", error);
        common_vendor.index.showToast({
          title: "网络异常，请稍后再试",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
        refresherTriggered.value = false;
      }
    };
    const onRefresh = () => {
      refresherTriggered.value = true;
      loadConfigList(true);
    };
    const loadMore = () => {
      if (!isLoading.value && hasMore.value) {
        loadConfigList();
      }
    };
    const onSearch = () => {
      loadConfigList(true);
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
    const editConfig = (config) => {
      common_vendor.index.navigateTo({
        url: `/pages/admin/recruitment/edit?id=${config.id}`
      });
    };
    const createConfig = () => {
      common_vendor.index.navigateTo({
        url: "/pages/admin/recruitment/edit"
      });
    };
    const toggleStatus = async (config) => {
      try {
        const data = {
          id: config.id,
          status: config.status === 1 ? 0 : 1
        };
        common_vendor.index.showLoading({ title: "处理中..." });
        const response = await api_api.apiModule.admin.recruitment.updateConfig(data);
        if (response.code === 200) {
          common_vendor.index.showToast({
            title: config.status === 1 ? "已禁用" : "已启用",
            icon: "success"
          });
          const index = configList.value.findIndex((item) => item.id === config.id);
          if (index !== -1) {
            configList.value[index].status = data.status;
          }
        } else {
          common_vendor.index.showToast({
            title: response.message || "操作失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/recruitment/configs.vue:229", "切换状态失败:", error);
        common_vendor.index.showToast({
          title: "网络异常，请稍后再试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const confirmDelete = (config) => {
      selectedConfig.value = config;
      deletePopup.value.open();
    };
    const cancelDelete = () => {
      selectedConfig.value = null;
      if (deletePopup.value)
        deletePopup.value.close();
    };
    const handleDelete = async () => {
      if (!selectedConfig.value)
        return;
      try {
        common_vendor.index.showLoading({ title: "删除中..." });
        const response = await api_api.apiModule.admin.recruitment.deleteConfig(selectedConfig.value.id);
        if (response.code === 200) {
          common_vendor.index.showToast({
            title: "删除成功",
            icon: "success"
          });
          configList.value = configList.value.filter((item) => item.id !== selectedConfig.value.id);
        } else {
          common_vendor.index.showToast({
            title: response.message || "删除失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/admin/recruitment/configs.vue:274", "删除失败:", error);
        common_vendor.index.showToast({
          title: "网络异常，请稍后再试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
        selectedConfig.value = null;
        deletePopup.value.close();
      }
    };
    common_vendor.onMounted(() => {
      loadConfigList(true);
    });
    common_vendor.onShow(() => {
      loadConfigList(true);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "招新配置管理"
        }),
        b: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        c: common_vendor.o(onSearch),
        d: searchKeyword.value,
        e: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        f: common_vendor.o(onSearch),
        g: isLoading.value && currentPage.value === 1
      }, isLoading.value && currentPage.value === 1 ? {
        h: common_vendor.p({
          type: "spinner-cycle",
          size: "24",
          color: "#999"
        })
      } : common_vendor.e({
        i: common_vendor.f(configList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.name || "未命名配置"),
            b: common_vendor.t(item.status === 1 ? "启用中" : "已禁用"),
            c: common_vendor.n(item.status === 1 ? "normal" : "disabled"),
            d: common_vendor.t(item.semester || "未设置"),
            e: common_vendor.t(formatDate(item.globalStartTime)),
            f: common_vendor.t(formatDate(item.globalEndTime)),
            g: common_vendor.t(item.description || "无说明"),
            h: common_vendor.t(formatDate(item.createTime)),
            i: common_vendor.o(($event) => editConfig(item), item.id),
            j: common_vendor.t(item.status === 1 ? "禁用" : "启用"),
            k: common_vendor.n(item.status === 1 ? "disable-btn" : "enable-btn"),
            l: common_vendor.o(($event) => toggleStatus(item), item.id),
            m: common_vendor.o(($event) => confirmDelete(item), item.id),
            n: item.id
          };
        }),
        j: configList.value.length === 0
      }, configList.value.length === 0 ? {
        k: common_vendor.p({
          type: "info",
          size: "40",
          color: "#999"
        })
      } : {}, {
        l: isLoading.value && currentPage.value > 1
      }, isLoading.value && currentPage.value > 1 ? {} : {}, {
        m: !isLoading.value && !hasMore.value && configList.value.length > 0
      }, !isLoading.value && !hasMore.value && configList.value.length > 0 ? {} : {}), {
        n: common_vendor.o(loadMore),
        o: refresherTriggered.value,
        p: common_vendor.o(onRefresh),
        q: common_vendor.p({
          type: "plusempty",
          size: "28",
          color: "#fff"
        }),
        r: common_vendor.o(createConfig),
        s: common_vendor.o(handleDelete),
        t: common_vendor.o(cancelDelete),
        v: common_vendor.p({
          title: "确认删除",
          content: "确定要删除该招新配置吗？删除后无法恢复",
          ["before-close"]: true
        }),
        w: common_vendor.sr(deletePopup, "12d4ddbc-5", {
          "k": "deletePopup"
        }),
        x: common_vendor.p({
          type: "dialog"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-12d4ddbc"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/admin/recruitment/configs.js.map
