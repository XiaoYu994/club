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
  __name: "recruitment",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const searchKeyword = common_vendor.ref("");
    const currentTag = common_vendor.ref(0);
    const filterTags = common_vendor.ref([
      { name: "全部社团", type: "all" },
      { name: "普通社团", type: "normal" },
      { name: "院级社团", type: "college" },
      { name: "校级社团", type: "school" }
    ]);
    const clubList = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    common_vendor.onMounted(() => {
      loadClubs();
    });
    const loadClubs = async () => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        const params = {
          pageNo: page.value,
          pageSize: pageSize.value,
          keyword: searchKeyword.value,
          isRecruiting: true
          // 只查詢正在招新的社團
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
        const res = await proxy.$api.club.getClubList(params);
        if (res.code === 200) {
          const clubs = res.data.list || [];
          const clubsWithRecruit = await Promise.all(
            clubs.map(async (item) => {
              const recRes = await proxy.$api.club.getActiveRecruitment(item.id);
              if (recRes.code === 200 && recRes.data) {
                item.startTime = recRes.data.startTime;
                item.endTime = recRes.data.endTime;
              }
              return item;
            })
          );
          if (page.value === 1) {
            clubList.value = clubsWithRecruit;
          } else {
            clubList.value = [...clubList.value, ...clubsWithRecruit];
          }
          hasMore.value = clubsWithRecruit.length === pageSize.value;
          page.value++;
        } else {
          common_vendor.index.showToast({
            title: res.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/recruitment.vue:184", "加載社團列表失敗", error);
        common_vendor.index.showToast({
          title: "網絡異常，請稍後重試",
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
    const goToApply = (club) => {
      common_vendor.index.navigateTo({
        url: `/pages/club/apply?clubId=${club.id}`
      });
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          title: "社团招新",
          showBack: true
        }),
        c: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        d: common_vendor.o(searchClubs),
        e: searchKeyword.value,
        f: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        g: common_vendor.f(filterTags.value, (tag, idx, i0) => {
          return {
            a: common_vendor.t(tag.name),
            b: idx,
            c: common_vendor.n(currentTag.value === idx ? "active" : ""),
            d: common_vendor.o(($event) => switchTag(idx), idx)
          };
        }),
        h: common_vendor.f(clubList.value, (item, idx, i0) => {
          return {
            a: item.logo || "/static/images/default-club.png",
            b: common_vendor.t(item.name),
            c: common_vendor.t(item.description || "暂无简介"),
            d: "701889bc-2-" + i0,
            e: common_vendor.t(item.endTime ? common_vendor.unref(utils_common.formatDate)(item.endTime) : "暂无"),
            f: "701889bc-3-" + i0,
            g: common_vendor.t(item.memberCount || 0),
            h: common_vendor.f(item.tags ? item.tags.split(",") : [], (tag, tagIdx, i1) => {
              return {
                a: common_vendor.t(tag),
                b: tagIdx
              };
            }),
            i: idx,
            j: common_vendor.o(($event) => goToApply(item), idx)
          };
        }),
        i: common_vendor.p({
          type: "calendar",
          size: "14",
          color: "#666"
        }),
        j: common_vendor.p({
          type: "personadd",
          size: "14",
          color: "#666"
        }),
        k: isLoading.value
      }, isLoading.value ? {
        l: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#999"
        })
      } : {}, {
        m: clubList.value.length === 0 && !isLoading.value
      }, clubList.value.length === 0 && !isLoading.value ? {
        n: common_assets._imports_0$6
      } : {}, {
        o: clubList.value.length > 0 && !hasMore.value
      }, clubList.value.length > 0 && !hasMore.value ? {} : {}, {
        p: refreshing.value,
        q: common_vendor.o(refreshClubs),
        r: common_vendor.o(loadMore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-701889bc"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/club/recruitment.js.map
