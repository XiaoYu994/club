"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (CustomNavBar + _easycom_uni_icons)();
}
const CustomNavBar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
const _sfc_main = {
  __name: "topTen",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const clubList = common_vendor.ref([]);
    const loadTopTen = async () => {
      try {
        const params = { pageNo: 1, pageSize: 10, orderBy: "order_num", isAsc: true };
        const res = await proxy.$api.club.getClubList(params);
        if (res.code === 200) {
          clubList.value = res.data.list || [];
        } else {
          common_vendor.index.showToast({ title: res.msg || "加载失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/topTen.vue:64", "获取十佳社团失败", error);
        common_vendor.index.showToast({ title: "网络异常，请稍后重试", icon: "none" });
      }
    };
    const goToDetail = (item) => {
      common_vendor.index.navigateTo({ url: `/pages/club/detail?id=${item.id}` });
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
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
    common_vendor.onMounted(() => {
      loadTopTen();
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          title: "十佳社团",
          showBack: true
        }),
        c: common_vendor.f(clubList.value, (item, idx, i0) => {
          return {
            a: item.logo || "/static/images/default-club.png",
            b: common_vendor.t(item.name),
            c: common_vendor.t(getTypeText(item.type)),
            d: common_vendor.n(getTypeClass(item.type)),
            e: common_vendor.t(item.description || "暂无简介"),
            f: "708a1309-1-" + i0,
            g: common_vendor.t(item.memberCount || 0),
            h: "708a1309-2-" + i0,
            i: common_vendor.t(item.address || "暂无地址"),
            j: "708a1309-3-" + i0,
            k: common_vendor.t(item.viewCount || 0),
            l: idx,
            m: common_vendor.o(($event) => goToDetail(item), idx)
          };
        }),
        d: common_vendor.p({
          type: "person",
          size: "14",
          color: "#666"
        }),
        e: common_vendor.p({
          type: "location",
          size: "14",
          color: "#666"
        }),
        f: common_vendor.p({
          type: "eye",
          size: "14",
          color: "#999"
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-708a1309"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/club/topTen.js.map
