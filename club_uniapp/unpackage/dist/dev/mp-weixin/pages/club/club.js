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
  (_easycom_custom_nav_bar + _easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "club",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const isTopTen = common_vendor.ref(false);
    const searchKeyword = common_vendor.ref("");
    const currentTag = common_vendor.ref(0);
    const filterTags = common_vendor.ref([
      { name: "全部社团", type: "all" },
      { name: "普通社团", type: "normal" },
      { name: "院级社团", type: "college" },
      { name: "校级社团", type: "school" }
    ]);
    const clubTypeOptions = [
      { name: "全部", value: -1 },
      { name: "普通社团", value: 0 },
      { name: "院级社团", value: 1 },
      { name: "校级社团", value: 2 }
    ];
    const sortOptions = [
      { name: "默认排序", value: "order_num" },
      { name: "成员数量", value: "member_count" },
      { name: "浏览量", value: "view_count" },
      { name: "最新创建", value: "create_time" }
    ];
    const filters = common_vendor.reactive({
      type: -1,
      sortBy: "order_num",
      // 按照降序排
      isAsc: true
    });
    const clubList = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const filterPopup = common_vendor.ref(null);
    common_vendor.onMounted(() => {
      var _a;
      const pages = getCurrentPages();
      const options = ((_a = pages[pages.length - 1]) == null ? void 0 : _a.options) || {};
      if (options.topTen === "1") {
        isTopTen.value = true;
        pageSize.value = 10;
        filters.sortBy = "order_num";
        filters.isAsc = true;
      }
      loadClubs();
    });
    const getTypeText = (type) => {
      switch (type) {
        case 0:
          return "普通社团";
        case 1:
          return "院级社团";
        case 2:
          return "校级社团";
        default:
          return "未知类型";
      }
    };
    const getTypeClass = (type) => {
      switch (type) {
        case 0:
          return "normal";
        case 1:
          return "college";
        case 2:
          return "school";
        default:
          return "";
      }
    };
    const loadClubs = async () => {
      if (isTopTen.value) {
        try {
          const res = await proxy.$api.club.getTopTenClubs();
          if (res.code === 200) {
            clubList.value = res.data || [];
          } else {
            common_vendor.index.showToast({ title: res.msg || "加载失败", icon: "none" });
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/club/club.vue:264", "获取十佳社团失败", error);
          common_vendor.index.showToast({ title: "网络异常，请稍后重试", icon: "none" });
        }
        return;
      }
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
          if (tagType === "normal") {
            params.type = 0;
          } else if (tagType === "college") {
            params.type = 1;
          } else if (tagType === "school") {
            params.type = 2;
          }
        }
        if (filters.type !== -1) {
          params.type = filters.type;
        }
        const res = await proxy.$api.club.getClubList(params);
        if (res.code === 200) {
          const clubs = res.data.list || [];
          if (page.value === 1) {
            clubList.value = clubs;
          } else {
            clubList.value = [...clubList.value, ...clubs];
          }
          hasMore.value = clubs.length === pageSize.value;
          page.value++;
        } else {
          common_vendor.index.showToast({
            title: res.msg || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/club.vue:321", "加载社团列表失败", error);
        common_vendor.index.showToast({
          title: "网络异常，请稍后重试",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
        refreshing.value = false;
      }
    };
    const refreshClubs = () => {
      refreshing.value = true;
      page.value = 1;
      hasMore.value = true;
      searchKeyword.value = "";
      currentTag.value = 0;
      resetFilters();
      loadClubs();
    };
    const loadMore = () => {
      if (hasMore.value && !isLoading.value) {
        loadClubs();
      }
    };
    const searchClubs = () => {
      page.value = 1;
      loadClubs();
    };
    const switchTag = (idx) => {
      if (currentTag.value === idx)
        return;
      currentTag.value = idx;
      page.value = 1;
      loadClubs();
    };
    const showFilterDrawer = () => {
      filterPopup.value.open();
    };
    const closeFilterDrawer = () => {
      filterPopup.value.close();
    };
    const selectType = (type) => {
      filters.type = type;
    };
    const selectSort = (sort) => {
      filters.sortBy = sort;
      filters.isAsc = false;
    };
    const resetFilters = () => {
      filters.type = -1;
      filters.sortBy = "order_num";
      filters.isAsc = true;
    };
    const applyFilters = () => {
      page.value = 1;
      closeFilterDrawer();
      loadClubs();
    };
    const goToDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/club/detail?id=${item.id}`
      });
    };
    const goToRecruitment = () => {
      common_vendor.index.navigateTo({
        url: "/pages/club/recruitment"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: "社团列表"
        }),
        b: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        c: common_vendor.o(searchClubs),
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
        i: common_vendor.f(clubList.value, (item, idx, i0) => {
          return {
            a: item.logo || "/static/images/default-club.png",
            b: common_vendor.t(item.name),
            c: common_vendor.t(getTypeText(item.type)),
            d: common_vendor.n(getTypeClass(item.type)),
            e: common_vendor.t(item.description || "暂无简介"),
            f: "3556ad49-3-" + i0,
            g: common_vendor.t(item.memberCount || 0),
            h: "3556ad49-4-" + i0,
            i: common_vendor.t(item.address || "暂无地址"),
            j: "3556ad49-5-" + i0,
            k: common_vendor.t(item.viewCount || 0),
            l: idx,
            m: common_vendor.o(($event) => goToDetail(item), idx)
          };
        }),
        j: common_vendor.p({
          type: "person",
          size: "14",
          color: "#666"
        }),
        k: common_vendor.p({
          type: "location",
          size: "14",
          color: "#666"
        }),
        l: common_vendor.p({
          type: "eye",
          size: "14",
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
        o: clubList.value.length === 0 && !isLoading.value
      }, clubList.value.length === 0 && !isLoading.value ? {
        p: common_assets._imports_0$6
      } : {}, {
        q: clubList.value.length > 0 && !hasMore.value
      }, clubList.value.length > 0 && !hasMore.value ? {} : {}, {
        r: refreshing.value,
        s: common_vendor.o(refreshClubs),
        t: common_vendor.o(loadMore),
        v: common_vendor.p({
          type: "close",
          size: "20",
          color: "#999"
        }),
        w: common_vendor.o(closeFilterDrawer),
        x: common_vendor.f(clubTypeOptions, (type, idx, i0) => {
          return {
            a: common_vendor.t(type.name),
            b: idx,
            c: common_vendor.n(filters.type === type.value ? "active" : ""),
            d: common_vendor.o(($event) => selectType(type.value), idx)
          };
        }),
        y: common_vendor.f(sortOptions, (sort, idx, i0) => {
          return {
            a: common_vendor.t(sort.name),
            b: idx,
            c: common_vendor.n(filters.sortBy === sort.value ? "active" : ""),
            d: common_vendor.o(($event) => selectSort(sort.value), idx)
          };
        }),
        z: common_vendor.o(resetFilters),
        A: common_vendor.o(applyFilters),
        B: common_vendor.sr(filterPopup, "3556ad49-7", {
          "k": "filterPopup"
        }),
        C: common_vendor.p({
          type: "bottom"
        }),
        D: common_vendor.p({
          type: "personadd",
          size: "20",
          color: "#fff"
        }),
        E: common_vendor.o(goToRecruitment)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3556ad49"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/club/club.js.map
