"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
  __name: "manageRecruitment",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const statusBarHeight = common_vendor.ref(common_vendor.index.getSystemInfoSync().statusBarHeight || 20);
    const isLoading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const hasMore = common_vendor.ref(true);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const clubId = common_vendor.ref(null);
    const activeRecruitments = common_vendor.ref([]);
    const historyRecruitments = common_vendor.ref([]);
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      clubId.value = currentPage.options.clubId;
      loadData();
    });
    const loadData = async () => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        common_vendor.index.__f__("log", "at pages/club/manageRecruitment.vue:126", "开始加载招新数据，社团ID:", clubId.value);
        await loadActiveRecruitments();
        await loadHistoryRecruitments();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/manageRecruitment.vue:134", "加载招新数据失败", error);
        common_vendor.index.showToast({
          title: "加载招新数据失败，请稍后重试",
          icon: "none",
          duration: 3e3
        });
      } finally {
        isLoading.value = false;
        refreshing.value = false;
      }
    };
    const loadActiveRecruitments = async () => {
      try {
        const params = {
          pageNo: 1,
          pageSize: 10,
          status: 1
          // 进行中状态
        };
        const res = await proxy.$api.club.listRecruitments(clubId.value, params);
        if (res.code === 200) {
          activeRecruitments.value = res.data.list || [];
        } else {
          common_vendor.index.__f__("error", "at pages/club/manageRecruitment.vue:160", "加载当前招新活动失败:", res.message);
          common_vendor.index.showToast({
            title: res.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/manageRecruitment.vue:167", "加载当前招新活动失败", error);
        common_vendor.index.showToast({
          title: "加载当前招新活动失败",
          icon: "none"
        });
      }
    };
    const fallbackLoadHistoryRecruitments = async () => {
      try {
        common_vendor.index.__f__("log", "at pages/club/manageRecruitment.vue:178", "使用备用方法加载历史招新数据");
        const params = {
          pageNo: page.value,
          pageSize: pageSize.value,
          clubId: clubId.value,
          status: 2
          // 已结束状态
        };
        const res = await proxy.$api.club.getRecruitmentList(params);
        if (res.code === 200) {
          const list = res.data.list || [];
          if (page.value === 1) {
            historyRecruitments.value = list;
          } else {
            historyRecruitments.value = [...historyRecruitments.value, ...list];
          }
          hasMore.value = list.length === pageSize.value;
          if (list.length > 0) {
            page.value++;
          }
        } else {
          common_vendor.index.__f__("error", "at pages/club/manageRecruitment.vue:202", "备用方法加载历史招新数据失败:", res.message);
          common_vendor.index.showToast({
            title: res.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/manageRecruitment.vue:209", "备用方法加载历史招新数据失败:", error);
        common_vendor.index.showToast({
          title: "加载历史招新活动失败",
          icon: "none"
        });
      }
    };
    const loadHistoryRecruitments = async () => {
      try {
        const params = {
          pageNo: page.value,
          pageSize: pageSize.value,
          status: 2
          // 已结束状态
        };
        common_vendor.index.__f__("log", "at pages/club/manageRecruitment.vue:226", "尝试加载历史招新数据，参数:", params);
        try {
          const res = await proxy.$api.club.listRecruitments(clubId.value, params);
          if (res.code === 200) {
            const list = res.data.list || [];
            if (page.value === 1) {
              historyRecruitments.value = list;
            } else {
              historyRecruitments.value = [...historyRecruitments.value, ...list];
            }
            hasMore.value = list.length === pageSize.value;
            if (list.length > 0) {
              page.value++;
            }
          } else {
            throw new Error(res.message || "加载失败");
          }
        } catch (primaryError) {
          common_vendor.index.__f__("error", "at pages/club/manageRecruitment.vue:249", "主方法加载历史招新数据失败:", primaryError);
          common_vendor.index.__f__("log", "at pages/club/manageRecruitment.vue:250", "尝试使用备用方法加载历史招新数据");
          await fallbackLoadHistoryRecruitments();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/manageRecruitment.vue:254", "加载历史招新活动失败", error);
        common_vendor.index.showToast({
          title: "加载历史招新活动失败",
          icon: "none"
        });
      }
    };
    const refreshData = () => {
      refreshing.value = true;
      page.value = 1;
      hasMore.value = true;
      loadData();
    };
    const loadMore = () => {
      if (hasMore.value && !isLoading.value) {
        loadHistoryRecruitments();
      }
    };
    const getStatusText = (status) => {
      switch (status) {
        case 0:
          return "未开始";
        case 1:
          return "招新中";
        case 2:
          return "已结束";
        default:
          return "未知状态";
      }
    };
    const getStatusClass = (status) => {
      switch (status) {
        case 0:
          return "pending";
        case 1:
          return "active";
        case 2:
          return "ended";
        default:
          return "";
      }
    };
    const goToCreateRecruitment = () => {
      common_vendor.index.navigateTo({
        url: `/pages/club/createRecruitment?clubId=${clubId.value}`
      });
    };
    const goToEditRecruitment = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/club/editRecruitment?clubId=${clubId.value}&recruitmentId=${item.id}`
      });
    };
    const viewApplies = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/club/applies?clubId=${clubId.value}`
      });
    };
    const copyRecruitment = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/club/createRecruitment?clubId=${clubId.value}&copyFrom=${item.id}`
      });
    };
    const endRecruitment = (item) => {
      common_vendor.index.showModal({
        title: "结束招新",
        content: "确定要结束该招新活动吗？结束后将不再接受新的申请。",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "处理中..." });
              try {
                common_vendor.index.__f__("log", "at pages/club/manageRecruitment.vue:343", "尝试更新招新状态:", item.id, 2);
                const updateRes = await proxy.$api.club.updateRecruitmentStatus(item.id, 2);
                if (updateRes.code === 200) {
                  common_vendor.index.showToast({
                    title: "招新活动已结束",
                    icon: "success"
                  });
                  refreshData();
                } else {
                  throw new Error(updateRes.message || "操作失败");
                }
              } catch (primaryError) {
                common_vendor.index.__f__("error", "at pages/club/manageRecruitment.vue:358", "主方法更新招新状态失败:", primaryError);
                common_vendor.index.__f__("log", "at pages/club/manageRecruitment.vue:359", "尝试使用备用方法更新招新状态");
                const updateData = {
                  id: item.id,
                  status: 2
                };
                const updateRes = await proxy.$api.club.updateRecruitment(item.id, updateData);
                if (updateRes.code === 200) {
                  common_vendor.index.showToast({
                    title: "招新活动已结束",
                    icon: "success"
                  });
                  refreshData();
                } else {
                  throw new Error(updateRes.message || "操作失败");
                }
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/club/manageRecruitment.vue:382", "结束招新失败", error);
              common_vendor.index.showToast({
                title: error.message || "网络异常，请稍后重试",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: statusBarHeight.value + "px",
        b: common_vendor.o(goBack),
        c: common_vendor.p({
          title: "招新管理",
          showBack: true
        }),
        d: activeRecruitments.value.length > 0
      }, activeRecruitments.value.length > 0 ? {
        e: common_vendor.f(activeRecruitments.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.title),
            b: "b4c90a47-1-" + i0,
            c: common_vendor.t(common_vendor.unref(utils_common.formatDate)(item.startTime)),
            d: common_vendor.t(common_vendor.unref(utils_common.formatDate)(item.endTime)),
            e: "b4c90a47-2-" + i0,
            f: common_vendor.t(item.joinCount || 0),
            g: common_vendor.t(item.passCount || 0),
            h: common_vendor.t(item.planCount || 0),
            i: common_vendor.o(($event) => goToEditRecruitment(item), "active-" + index),
            j: common_vendor.o(($event) => viewApplies(), "active-" + index),
            k: item.status === 1
          }, item.status === 1 ? {
            l: common_vendor.o(($event) => endRecruitment(item), "active-" + index)
          } : {}, {
            m: "active-" + index
          });
        }),
        f: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#b13b7a"
        }),
        g: common_vendor.p({
          type: "personadd",
          size: "16",
          color: "#b13b7a"
        })
      } : {}, {
        h: historyRecruitments.value.length === 0
      }, historyRecruitments.value.length === 0 ? {
        i: common_assets._imports_0$5
      } : {}, {
        j: common_vendor.f(historyRecruitments.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.title),
            b: common_vendor.t(getStatusText(item.status)),
            c: common_vendor.n(getStatusClass(item.status)),
            d: "b4c90a47-3-" + i0,
            e: common_vendor.t(common_vendor.unref(utils_common.formatDate)(item.startTime)),
            f: common_vendor.t(common_vendor.unref(utils_common.formatDate)(item.endTime)),
            g: "b4c90a47-4-" + i0,
            h: common_vendor.t(item.joinCount || 0),
            i: common_vendor.t(item.passCount || 0),
            j: common_vendor.t(item.planCount || 0),
            k: common_vendor.o(($event) => goToEditRecruitment(item), "history-" + index),
            l: common_vendor.o(($event) => viewApplies(), "history-" + index),
            m: common_vendor.o(($event) => copyRecruitment(item), "history-" + index),
            n: "history-" + index
          };
        }),
        k: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#999"
        }),
        l: common_vendor.p({
          type: "personadd",
          size: "16",
          color: "#999"
        }),
        m: isLoading.value
      }, isLoading.value ? {
        n: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#999"
        })
      } : {}, {
        o: historyRecruitments.value.length > 0 && !hasMore.value
      }, historyRecruitments.value.length > 0 && !hasMore.value ? {} : {}, {
        p: refreshing.value,
        q: common_vendor.o(refreshData),
        r: common_vendor.o(loadMore),
        s: common_vendor.p({
          type: "plusempty",
          size: "20",
          color: "#fff"
        }),
        t: common_vendor.o(goToCreateRecruitment)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b4c90a47"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/club/manageRecruitment.js.map
