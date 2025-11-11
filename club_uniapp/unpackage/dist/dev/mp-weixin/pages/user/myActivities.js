"use strict";
const common_vendor = require("../../common/vendor.js");
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
  __name: "myActivities",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const activityList = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const loadActivities = async () => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        const res = await proxy.$api.activity.getMyActivities();
        if (res.code === 200) {
          const applies = res.data || [];
          const enriched = await Promise.all(
            applies.map(async (apply) => {
              const detailRes = await proxy.$api.activity.getActivityDetail(apply.activityId);
              if (detailRes.code === 200) {
                apply.poster = detailRes.data.poster;
                apply.title = detailRes.data.title;
              }
              return apply;
            })
          );
          activityList.value = enriched;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/myActivities.vue:81", "加载我的活动失败", error);
      } finally {
        isLoading.value = false;
        refreshing.value = false;
      }
    };
    const getApplyStatusText = (status) => {
      switch (status) {
        case 0:
          return "待审核";
        case 1:
          return "已通过";
        case 2:
          return "已拒绝";
        default:
          return "未知";
      }
    };
    const getCheckInStatusText = (status) => {
      switch (status) {
        case 0:
          return "未签到";
        case 1:
          return "已签到";
        default:
          return "未知";
      }
    };
    const refreshActivities = () => {
      refreshing.value = true;
      page.value = 1;
      loadActivities();
    };
    const loadMore = () => {
      if (hasMore.value && !isLoading.value)
        loadActivities();
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const goToDetail = (act) => {
      common_vendor.index.navigateTo({ url: `/pages/activity/activityDeatil?id=${act.activityId}` });
    };
    common_vendor.onMounted(() => {
      loadActivities();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          title: "我的活动",
          showBack: true
        }),
        c: common_vendor.f(activityList.value, (act, idx, i0) => {
          return {
            a: act.poster || "/static/images/default-activity.png",
            b: common_vendor.t(act.title),
            c: common_vendor.t(getApplyStatusText(act.status)),
            d: common_vendor.t(getCheckInStatusText(act.checkInStatus)),
            e: idx,
            f: common_vendor.o(($event) => goToDetail(act), idx)
          };
        }),
        d: isLoading.value
      }, isLoading.value ? {
        e: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#999"
        })
      } : {}, {
        f: activityList.value.length === 0 && !isLoading.value
      }, activityList.value.length === 0 && !isLoading.value ? {} : {}, {
        g: refreshing.value,
        h: common_vendor.o(refreshActivities),
        i: common_vendor.o(loadMore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-dc2080c9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/myActivities.js.map
