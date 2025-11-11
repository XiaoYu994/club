"use strict";
const common_vendor = require("../../common/vendor.js");
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
  __name: "myApplies",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const applyList = common_vendor.ref([]);
    const isLoading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const loadApplies = async () => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        const res = await proxy.$api.club.getMyClubApplies();
        common_vendor.index.__f__("log", "at pages/user/myApplies.vue:77", "申请数据:", res);
        if (res.code === 200) {
          applyList.value = res.data || [];
          common_vendor.index.__f__("log", "at pages/user/myApplies.vue:80", "申请列表:", applyList.value);
        } else {
          common_vendor.index.__f__("error", "at pages/user/myApplies.vue:82", "获取申请记录失败：", res.message);
          applyList.value = [];
          common_vendor.index.showToast({
            title: res.message || "获取申请记录失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/myApplies.vue:90", "加载我的申请失败", error);
        applyList.value = [];
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
        refreshing.value = false;
      }
    };
    const refreshApplies = () => {
      refreshing.value = true;
      loadApplies();
    };
    const loadMore = () => {
    };
    const getStatusText = (status) => {
      switch (status) {
        case 0:
          return "待审核";
        case 1:
          return "已通过";
        case 2:
          return "已拒绝";
        case 3:
          return "已面试";
        case 4:
          return "已入社";
        default:
          return "未知";
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const goToDetail = (id) => {
      common_vendor.index.navigateTo({ url: `/pages/club/detail?id=${id}` });
    };
    common_vendor.onMounted(() => {
      loadApplies();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          title: "我的申请",
          showBack: true
        }),
        c: common_vendor.f(applyList.value, (item, idx, i0) => {
          return common_vendor.e({
            a: item.clubLogo
          }, item.clubLogo ? {
            b: item.clubLogo
          } : {}, {
            c: common_vendor.t(item.clubName),
            d: item.recruitmentTitle
          }, item.recruitmentTitle ? {
            e: common_vendor.t(item.recruitmentTitle)
          } : {}, {
            f: common_vendor.t(getStatusText(item.status)),
            g: common_vendor.n("status-" + item.status),
            h: common_vendor.t(common_vendor.unref(utils_common.formatTime)(Number.parseInt(item.createTime))),
            i: item.feedback
          }, item.feedback ? {
            j: common_vendor.t(item.feedback)
          } : {}, {
            k: idx,
            l: common_vendor.o(($event) => goToDetail(item.clubId), idx)
          });
        }),
        d: isLoading.value
      }, isLoading.value ? {
        e: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#999"
        })
      } : {}, {
        f: applyList.value.length === 0 && !isLoading.value
      }, applyList.value.length === 0 && !isLoading.value ? {} : {}, {
        g: refreshing.value,
        h: common_vendor.o(refreshApplies),
        i: common_vendor.o(loadMore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-668d7b04"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/myApplies.js.map
