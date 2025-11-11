"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
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
  (_easycom_custom_nav_bar + _easycom_uni_icons + ActivityCard + _easycom_uni_popup)();
}
const ActivityCard = () => "../../components/activity-card/activity-card.js";
const _sfc_main = {
  __name: "activities",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const clubId = common_vendor.ref(null);
    const clubName = common_vendor.ref("");
    const searchKeyword = common_vendor.ref("");
    const currentTag = common_vendor.ref(0);
    const filterTags = common_vendor.ref([
      { name: "全部活动", type: "all" },
      { name: "进行中", type: "ongoing" },
      { name: "报名中", type: "signup" },
      { name: "已结束", type: "ended" }
    ]);
    const statusOptions = [
      { name: "全部", value: -1 },
      { name: "报名中", value: 1 },
      { name: "进行中", value: 2 },
      { name: "已结束", value: 3 },
      { name: "已取消", value: 0 }
    ];
    const sortOptions = [
      { name: "创建时间", value: "create_time" },
      { name: "开始时间", value: "start_time" },
      { name: "报名人数", value: "join_count" }
    ];
    const filters = common_vendor.reactive({
      status: -1,
      sortBy: "create_time",
      isAsc: false
    });
    const activityList = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const isAdmin = common_vendor.ref(false);
    const filterPopup = common_vendor.ref(null);
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      clubId.value = currentPage.options.clubId;
      clubName.value = decodeURIComponent(currentPage.options.clubName || "");
      checkUserRole();
      loadActivities();
    });
    const checkUserRole = async () => {
      try {
        if (!clubId.value)
          return;
        const res = await proxy.$api.club.getUserRole(clubId.value);
        if (res.code === 200 && res.data) {
          isAdmin.value = res.data.type > 0 && res.data.status === 1;
        } else {
          isAdmin.value = false;
        }
      } catch (error) {
        isAdmin.value = false;
      }
    };
    const loadActivities = async () => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        const params = {
          pageNo: page.value,
          pageSize: pageSize.value,
          keyword: searchKeyword.value,
          orderBy: filters.sortBy,
          isAsc: filters.isAsc
        };
        if (currentTag.value > 0) {
          const tagType = filterTags.value[currentTag.value].type;
          if (tagType === "ongoing") {
            params.status = 2;
          } else if (tagType === "signup") {
            params.status = 1;
          } else if (tagType === "ended") {
            params.status = 3;
          }
        }
        if (filters.status !== -1) {
          params.status = filters.status;
        }
        const res = await proxy.$api.activity.getClubActivities(clubId.value, params);
        if (res.code === 200) {
          const activities = res.data.list || [];
          if (page.value === 1) {
            activityList.value = activities;
          } else {
            activityList.value = [...activityList.value, ...activities];
          }
          hasMore.value = activities.length === pageSize.value;
          page.value++;
        } else {
          common_vendor.index.showToast({
            title: res.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/activities.vue:278", "加载活动列表失败", error);
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
    const switchTag = (idx) => {
      if (currentTag.value === idx)
        return;
      currentTag.value = idx;
      page.value = 1;
      loadActivities();
    };
    const showFilterDrawer = () => {
      filterPopup.value.open();
    };
    const closeFilterDrawer = () => {
      filterPopup.value.close();
    };
    const selectStatus = (status) => {
      filters.status = status;
    };
    const selectSort = (sort) => {
      filters.sortBy = sort;
      filters.isAsc = false;
    };
    const resetFilters = () => {
      filters.status = -1;
      filters.sortBy = "create_time";
      filters.isAsc = false;
    };
    const applyFilters = () => {
      page.value = 1;
      closeFilterDrawer();
      loadActivities();
    };
    const goToActivityDetail = (activity) => {
      common_vendor.index.navigateTo({
        url: `/pages/activity/activityDeatil?id=${activity.id}`
      });
    };
    const createActivity = () => {
      common_vendor.index.navigateTo({
        url: `/pages/activity/edit?clubId=${clubId.value}`
      });
    };
    const editActivity = (activity) => {
      common_vendor.index.navigateTo({
        url: `/pages/activity/edit?id=${activity.id}&clubId=${clubId.value}`
      });
    };
    const deleteActivity = (activity) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除活动"${activity.title}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "处理中..." });
              const result = await proxy.$api.activity.deleteActivity(activity.id);
              if (result.code === 200) {
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                activityList.value = activityList.value.filter((item) => item.id !== activity.id);
              } else {
                common_vendor.index.showToast({
                  title: result.message || "删除失败",
                  icon: "none"
                });
              }
            } catch (error) {
              common_vendor.index.showToast({
                title: "网络异常，请稍后重试",
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
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          title: "社团活动 - " + clubName.value,
          showBack: true
        }),
        c: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        d: common_vendor.o(searchActivities),
        e: searchKeyword.value,
        f: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        g: isAdmin.value
      }, isAdmin.value ? {
        h: common_vendor.p({
          type: "paperplane",
          size: "18",
          color: "#b13b7a"
        }),
        i: common_vendor.o(showFilterDrawer)
      } : {}, {
        j: common_vendor.f(filterTags.value, (tag, idx, i0) => {
          return {
            a: common_vendor.t(tag.name),
            b: idx,
            c: common_vendor.n(currentTag.value === idx ? "active" : ""),
            d: common_vendor.o(($event) => switchTag(idx), idx)
          };
        }),
        k: common_vendor.f(activityList.value, (item, idx, i0) => {
          return {
            a: idx,
            b: common_vendor.o(goToActivityDetail, idx),
            c: common_vendor.o(editActivity, idx),
            d: common_vendor.o(deleteActivity, idx),
            e: "eddafd8f-3-" + i0,
            f: common_vendor.p({
              activity: item,
              isAdmin: isAdmin.value
            })
          };
        }),
        l: isLoading.value
      }, isLoading.value ? {
        m: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#999"
        })
      } : {}, {
        n: activityList.value.length === 0 && !isLoading.value
      }, activityList.value.length === 0 && !isLoading.value ? {
        o: common_assets._imports_0$5
      } : {}, {
        p: activityList.value.length > 0 && !hasMore.value
      }, activityList.value.length > 0 && !hasMore.value ? {} : {}, {
        q: refreshing.value,
        r: common_vendor.o(refreshActivities),
        s: common_vendor.o(loadMore),
        t: common_vendor.p({
          type: "close",
          size: "20",
          color: "#999"
        }),
        v: common_vendor.o(closeFilterDrawer),
        w: common_vendor.f(statusOptions, (status, idx, i0) => {
          return {
            a: common_vendor.t(status.name),
            b: idx,
            c: common_vendor.n(filters.status === status.value ? "active" : ""),
            d: common_vendor.o(($event) => selectStatus(status.value), idx)
          };
        }),
        x: common_vendor.f(sortOptions, (sort, idx, i0) => {
          return {
            a: common_vendor.t(sort.name),
            b: idx,
            c: common_vendor.n(filters.sortBy === sort.value ? "active" : ""),
            d: common_vendor.o(($event) => selectSort(sort.value), idx)
          };
        }),
        y: common_vendor.o(resetFilters),
        z: common_vendor.o(applyFilters),
        A: common_vendor.sr(filterPopup, "eddafd8f-5", {
          "k": "filterPopup"
        }),
        B: common_vendor.p({
          type: "bottom"
        }),
        C: isAdmin.value
      }, isAdmin.value ? {
        D: common_vendor.p({
          type: "plusempty",
          size: "20",
          color: "#fff"
        }),
        E: common_vendor.o(createActivity)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-eddafd8f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/club/activities.js.map
