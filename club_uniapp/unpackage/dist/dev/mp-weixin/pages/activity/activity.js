"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_common = require("../../utils/common.js");
const utils_activity = require("../../utils/activity.js");
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
  __name: "activity",
  setup(__props, { expose: __expose }) {
    const { proxy } = common_vendor.getCurrentInstance();
    const statusBarHeight = common_vendor.ref(0);
    common_vendor.ref(true);
    const searchKeyword = common_vendor.ref("");
    const currentTag = common_vendor.ref(0);
    const filterTags = common_vendor.ref([
      { name: "全部活动", type: "all" },
      { name: "正在报名", type: "enrolling" },
      { name: "进行中", type: "ongoing" },
      { name: "已结束", type: "ended" }
    ]);
    const clubTypeOptions = [
      { name: "全部", value: -1 },
      { name: "普通社团", value: 0 },
      { name: "院级社团", value: 1 },
      { name: "校级社团", value: 2 }
    ];
    const filters = common_vendor.reactive({
      startDate: "",
      endDate: "",
      clubType: -1
    });
    const activityList = common_vendor.ref([]);
    const filteredActivityList = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const filterPopup = common_vendor.ref(null);
    let unlistenActivityDataChanged = null;
    const getPosterUrl = (url) => {
      return utils_common.getImageUrl(url, "/static/images/default-poster.png", false);
    };
    const formatDate1 = (timestamp) => {
      if (!timestamp)
        return "未设置";
      timestamp = Number(timestamp);
      const date = new Date(timestamp);
      return utils_common.formatDate(date);
    };
    const getActualStatus = (activity) => {
      if (!activity)
        return -1;
      const now = Date.now();
      const startTime = Number(activity.startTime || 0);
      const endTime = Number(activity.endTime || 0);
      if (activity.status === 3) {
        return 3;
      }
      if (activity.status === 0) {
        return 0;
      }
      if (activity.status === 2) {
        if (now < startTime) {
          return 1;
        } else if (now >= startTime && now < endTime) {
          return 2;
        } else {
          return 3;
        }
      }
      return -1;
    };
    const getStatusText = (activity) => {
      const actualStatus = getActualStatus(activity);
      switch (actualStatus) {
        case 0:
          return "已取消";
        case 1:
          return "报名中";
        case 2:
          return "进行中";
        case 3:
          return "已结束";
        default:
          return "未知";
      }
    };
    const getStatusClass = (activity) => {
      const actualStatus = getActualStatus(activity);
      switch (actualStatus) {
        case 0:
          return "cancelled";
        case 1:
          return "enrolling";
        case 2:
          return "ongoing";
        case 3:
          return "ended";
        default:
          return "";
      }
    };
    const filterActivitiesLocally = () => {
      const now = Date.now();
      if (currentTag.value === 0) {
        filteredActivityList.value = activityList.value;
      } else if (currentTag.value === 1) {
        filteredActivityList.value = activityList.value.filter((activity) => {
          return activity.status === 2 && now < Number(activity.startTime);
        });
      } else if (currentTag.value === 2) {
        filteredActivityList.value = activityList.value.filter((activity) => {
          const startTime = Number(activity.startTime);
          const endTime = Number(activity.endTime);
          return activity.status === 2 && now >= startTime && now < endTime;
        });
      } else if (currentTag.value === 3) {
        filteredActivityList.value = activityList.value.filter((activity) => {
          return activity.status === 3;
        });
      }
    };
    const switchTag = (index) => {
      currentTag.value = index;
      filterActivitiesLocally();
    };
    const loadActivities = async () => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        const params = {
          pageNo: page.value,
          pageSize: pageSize.value,
          keyword: searchKeyword.value
        };
        if (filters.startDate) {
          params.startTime = new Date(filters.startDate).getTime();
        }
        if (filters.endDate) {
          params.endTime = new Date(filters.endDate).getTime();
        }
        if (filters.clubType !== -1) {
          params.clubType = filters.clubType;
        }
        const res = await proxy.$api.activity.getActivityList(params);
        if (res.code === 200) {
          const activities = res.data.list || [];
          activities.forEach((activity) => {
            if (activity.poster) {
              activity.poster = utils_common.getImageUrl(activity.poster);
            }
          });
          if (page.value === 1) {
            activityList.value = activities;
          } else {
            activityList.value = [...activityList.value, ...activities];
          }
          filterActivitiesLocally();
          hasMore.value = activities.length === pageSize.value;
          page.value++;
        } else {
          common_vendor.index.showToast({
            title: res.msg || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/activity/activity.vue:380", "加载活动列表失败", error);
        common_vendor.index.showToast({
          title: "网络异常，请稍后重试",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
        refreshing.value = false;
      }
    };
    const refreshActivities = () => {
      refreshing.value = true;
      page.value = 1;
      hasMore.value = true;
      searchKeyword.value = "";
      currentTag.value = 0;
      resetFilters();
      loadActivities();
    };
    const loadMore = () => {
      if (hasMore.value && !isLoading.value) {
        loadActivities();
      }
    };
    const searchActivities = () => {
      page.value = 1;
      loadActivities();
    };
    const showFilterDrawer = () => {
      filterPopup.value.open();
    };
    const closeFilterDrawer = () => {
      filterPopup.value.close();
    };
    const selectClubType = (type) => {
      filters.clubType = type;
    };
    const onStartDateChange = (e) => {
      filters.startDate = e.detail.value;
    };
    const onEndDateChange = (e) => {
      filters.endDate = e.detail.value;
    };
    const resetFilters = () => {
      filters.startDate = "";
      filters.endDate = "";
      filters.clubType = -1;
    };
    const applyFilters = () => {
      page.value = 1;
      closeFilterDrawer();
      loadActivities();
    };
    const goToDetail = (item) => {
      try {
        const processedItem = {
          ...item,
          startTime: Number(item.startTime),
          endTime: Number(item.endTime)
        };
        const itemData = encodeURIComponent(JSON.stringify(processedItem));
        common_vendor.index.navigateTo({
          url: `/pages/activity/activityDeatil?id=${item.id}&itemData=${itemData}`
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/activity/activity.vue:487", "跳转详情页出错", error);
        common_vendor.index.navigateTo({
          url: `/pages/activity/activityDeatil?id=${item.id}`
        });
      }
    };
    common_vendor.onMounted(() => {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      statusBarHeight.value = systemInfo.statusBarHeight || 20;
      loadActivities();
      unlistenActivityDataChanged = utils_activity.listenActivityDataChanged(() => {
        common_vendor.index.__f__("log", "at pages/activity/activity.vue:506", "接收到活动数据变化事件，刷新列表");
        page.value = 1;
        loadActivities();
      });
    });
    common_vendor.onBeforeUnmount(() => {
      if (unlistenActivityDataChanged) {
        unlistenActivityDataChanged();
      }
    });
    __expose({
      onShow() {
        common_vendor.index.__f__("log", "at pages/activity/activity.vue:527", "页面显示，刷新活动列表");
        page.value = 1;
        loadActivities();
      },
      onHide() {
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "社团活动	"
        }),
        b: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        c: common_vendor.o(searchActivities),
        d: searchKeyword.value,
        e: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        f: common_vendor.p({
          type: "paperplane",
          size: "18",
          color: "#b13b7a"
        }),
        g: common_vendor.o(showFilterDrawer),
        h: common_vendor.f(filterTags.value, (tag, idx, i0) => {
          return {
            a: common_vendor.t(tag.name),
            b: idx,
            c: common_vendor.n(currentTag.value === idx ? "active" : ""),
            d: common_vendor.o(($event) => switchTag(idx), idx)
          };
        }),
        i: common_vendor.f(filteredActivityList.value, (item, idx, i0) => {
          return {
            a: getPosterUrl(item.poster),
            b: common_vendor.t(item.title),
            c: "da48f91d-3-" + i0,
            d: common_vendor.t(formatDate1(item.startTime)),
            e: "da48f91d-4-" + i0,
            f: common_vendor.t(item.address || "待定"),
            g: common_vendor.t(getStatusText(item)),
            h: common_vendor.n(getStatusClass(item)),
            i: common_vendor.t(item.joinCount || 0),
            j: idx,
            k: common_vendor.o(($event) => goToDetail(item), idx)
          };
        }),
        j: common_vendor.p({
          type: "calendar",
          size: "14",
          color: "#666"
        }),
        k: common_vendor.p({
          type: "location",
          size: "14",
          color: "#666"
        }),
        l: isLoading.value
      }, isLoading.value ? {
        m: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#999"
        })
      } : {}, {
        n: filteredActivityList.value.length === 0 && !isLoading.value
      }, filteredActivityList.value.length === 0 && !isLoading.value ? {
        o: common_assets._imports_0
      } : {}, {
        p: filteredActivityList.value.length > 0 && !hasMore.value
      }, filteredActivityList.value.length > 0 && !hasMore.value ? {} : {}, {
        q: refreshing.value,
        r: common_vendor.o(refreshActivities),
        s: common_vendor.o(loadMore),
        t: common_vendor.p({
          type: "close",
          size: "20",
          color: "#999"
        }),
        v: common_vendor.o(closeFilterDrawer),
        w: common_vendor.t(filters.startDate || "开始日期"),
        x: !filters.startDate ? 1 : "",
        y: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#999"
        }),
        z: filters.startDate,
        A: common_vendor.o(onStartDateChange),
        B: common_vendor.t(filters.endDate || "结束日期"),
        C: !filters.endDate ? 1 : "",
        D: common_vendor.p({
          type: "calendar",
          size: "16",
          color: "#999"
        }),
        E: filters.endDate,
        F: common_vendor.o(onEndDateChange),
        G: common_vendor.f(clubTypeOptions, (type, idx, i0) => {
          return {
            a: common_vendor.t(type.name),
            b: idx,
            c: common_vendor.n(filters.clubType === type.value ? "active" : ""),
            d: common_vendor.o(($event) => selectClubType(type.value), idx)
          };
        }),
        H: common_vendor.o(resetFilters),
        I: common_vendor.o(applyFilters),
        J: common_vendor.sr(filterPopup, "da48f91d-6", {
          "k": "filterPopup"
        }),
        K: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-da48f91d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/activity/activity.js.map
