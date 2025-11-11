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
  __name: "myClubs",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const clubList = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    common_vendor.ref(9999);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const loadClubs = async () => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        const res = await proxy.$api.club.getMyClubs();
        if (res.code === 200) {
          let list = res.data || [];
          list = await Promise.all(
            list.map(async (c) => {
              const statusRes = await proxy.$api.club.checkApplyStatus(c.id);
              c.memberStatus = statusRes.code === 200 && statusRes.data ? statusRes.data.status : 0;
              return c;
            })
          );
          clubList.value = list;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/myClubs.vue:74", "加载我的社团失败", error);
        clubList.value = [];
      } finally {
        isLoading.value = false;
        refreshing.value = false;
      }
    };
    const getMemberStatusText = (status) => {
      switch (status) {
        case 0:
          return "未通过";
        case 1:
          return "已入社";
        case 2:
          return "退社申请中";
        default:
          return "未知";
      }
    };
    const refreshClubs = () => {
      refreshing.value = true;
      page.value = 1;
      loadClubs();
    };
    const loadMore = () => {
      if (hasMore.value && !isLoading.value) {
        loadClubs();
      }
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const goToDetail = (club) => {
      common_vendor.index.navigateTo({ url: `/pages/club/detail?id=${club.id}` });
    };
    common_vendor.onMounted(() => {
      loadClubs();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          title: "我的社团",
          showBack: true
        }),
        c: common_vendor.f(clubList.value, (club, idx, i0) => {
          return {
            a: club.logo || "/static/images/default-club.png",
            b: common_vendor.t(club.name),
            c: common_vendor.t(getMemberStatusText(club.memberStatus)),
            d: idx,
            e: common_vendor.o(($event) => goToDetail(club), idx)
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
        f: clubList.value.length === 0 && !isLoading.value
      }, clubList.value.length === 0 && !isLoading.value ? {} : {}, {
        g: refreshing.value,
        h: common_vendor.o(refreshClubs),
        i: common_vendor.o(loadMore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4da26f5c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/myClubs.js.map
