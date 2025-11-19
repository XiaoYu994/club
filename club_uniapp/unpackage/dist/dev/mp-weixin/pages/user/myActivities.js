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
    const formatTime = (timestamp) => {
      if (!timestamp)
        return "";
      const ts = timestamp < 1e10 ? timestamp * 1e3 : timestamp;
      const date = new Date(ts);
      if (isNaN(date.getTime())) {
        common_vendor.index.__f__("warn", "at pages/user/myActivities.vue:87", "[时间格式化] 无效的时间戳:", timestamp);
        return "";
      }
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${month}-${day} ${hours}:${minutes}`;
    };
    const loadActivities = async () => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        common_vendor.index.__f__("log", "at pages/user/myActivities.vue:103", "[我的活动] 开始加载活动列表...");
        const res = await proxy.$api.activity.getMyActivities();
        common_vendor.index.__f__("log", "at pages/user/myActivities.vue:105", "[我的活动] API响应:", res);
        if (res.code === 200) {
          const applies = res.data || [];
          common_vendor.index.__f__("log", "at pages/user/myActivities.vue:109", "[我的活动] 获取到报名记录数:", applies.length);
          const enriched = await Promise.all(
            applies.map(async (apply) => {
              try {
                const detailRes = await proxy.$api.activity.getActivityDetail(apply.activityId);
                if (detailRes.code === 200) {
                  const detail = detailRes.data;
                  return {
                    ...apply,
                    poster: detail.poster,
                    title: detail.title,
                    description: detail.description,
                    startTime: detail.startTime,
                    endTime: detail.endTime,
                    address: detail.address,
                    activityStatus: detail.status
                    // 活动状态（0=取消 1=计划中 2=进行中 3=已结束）
                  };
                } else {
                  common_vendor.index.__f__("warn", "at pages/user/myActivities.vue:130", `[我的活动] 获取活动详情失败 activityId=${apply.activityId}`, detailRes);
                  return apply;
                }
              } catch (err) {
                common_vendor.index.__f__("error", "at pages/user/myActivities.vue:134", `[我的活动] 获取活动详情异常 activityId=${apply.activityId}`, err);
                return apply;
              }
            })
          );
          activityList.value = enriched;
          common_vendor.index.__f__("log", "at pages/user/myActivities.vue:141", "[我的活动] 最终活动列表:", enriched);
        } else {
          common_vendor.index.__f__("error", "at pages/user/myActivities.vue:143", "[我的活动] API返回错误码:", res.code, res.msg);
          common_vendor.index.showToast({
            title: res.msg || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/myActivities.vue:150", "[我的活动] 加载活动列表异常:", error);
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
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
    const getApplyStatusClass = (status) => {
      switch (status) {
        case 0:
          return "status-pending";
        case 1:
          return "status-approved";
        case 2:
          return "status-rejected";
        default:
          return "status-unknown";
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
    const getCheckInStatusClass = (status) => {
      switch (status) {
        case 0:
          return "status-not-checked";
        case 1:
          return "status-checked";
        default:
          return "status-unknown";
      }
    };
    const getActivityStatusText = (status) => {
      switch (status) {
        case 0:
          return "已取消";
        case 1:
          return "计划中";
        case 2:
          return "进行中";
        case 3:
          return "已结束";
        default:
          return "";
      }
    };
    const getActivityStatusClass = (status) => {
      switch (status) {
        case 0:
          return "status-cancelled";
        case 1:
          return "status-planned";
        case 2:
          return "status-ongoing";
        case 3:
          return "status-finished";
        default:
          return "status-unknown";
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
          return common_vendor.e({
            a: act.poster || "/static/images/default-activity.png",
            b: common_vendor.t(act.title || "活动标题加载中..."),
            c: act.startTime
          }, act.startTime ? {
            d: "dc2080c9-1-" + i0,
            e: common_vendor.p({
              type: "calendar",
              size: "14",
              color: "#999"
            }),
            f: common_vendor.t(formatTime(act.startTime))
          } : {}, {
            g: act.address
          }, act.address ? {
            h: "dc2080c9-2-" + i0,
            i: common_vendor.p({
              type: "location",
              size: "14",
              color: "#999"
            }),
            j: common_vendor.t(act.address)
          } : {}, {
            k: common_vendor.t(getApplyStatusText(act.status)),
            l: common_vendor.n(getApplyStatusClass(act.status)),
            m: common_vendor.t(getCheckInStatusText(act.checkInStatus)),
            n: common_vendor.n(getCheckInStatusClass(act.checkInStatus)),
            o: act.activityStatus !== void 0
          }, act.activityStatus !== void 0 ? {
            p: common_vendor.t(getActivityStatusText(act.activityStatus)),
            q: common_vendor.n(getActivityStatusClass(act.activityStatus))
          } : {}, {
            r: idx,
            s: common_vendor.o(($event) => goToDetail(act), idx)
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
        f: activityList.value.length === 0 && !isLoading.value
      }, activityList.value.length === 0 && !isLoading.value ? {
        g: common_vendor.p({
          type: "inbox",
          size: "80",
          color: "#ddd"
        })
      } : {}, {
        h: refreshing.value,
        i: common_vendor.o(refreshActivities),
        j: common_vendor.o(loadMore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-dc2080c9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/myActivities.js.map
