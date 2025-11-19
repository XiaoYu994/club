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
        common_vendor.index.__f__("log", "at pages/user/myClubs.vue:77", "[我的社团] 开始加载社团列表...");
        const res = await proxy.$api.club.getMyClubs();
        common_vendor.index.__f__("log", "at pages/user/myClubs.vue:79", "[我的社团] API响应:", res);
        if (res.code === 200) {
          let list = res.data || [];
          common_vendor.index.__f__("log", "at pages/user/myClubs.vue:83", "[我的社团] 获取到社团数:", list.length);
          list = await Promise.all(
            list.map(async (c) => {
              try {
                const statusRes = await proxy.$api.club.checkApplyStatus(c.id);
                c.memberStatus = statusRes.code === 200 && statusRes.data ? statusRes.data.status : 0;
                return c;
              } catch (err) {
                common_vendor.index.__f__("warn", "at pages/user/myClubs.vue:93", `[我的社团] 获取社团状态失败 clubId=${c.id}`, err);
                c.memberStatus = 0;
                return c;
              }
            })
          );
          clubList.value = list;
          common_vendor.index.__f__("log", "at pages/user/myClubs.vue:101", "[我的社团] 最终社团列表:", list);
        } else {
          common_vendor.index.__f__("error", "at pages/user/myClubs.vue:103", "[我的社团] API返回错误码:", res.code, res.msg);
          common_vendor.index.showToast({
            title: res.msg || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/myClubs.vue:110", "[我的社团] 加载社团列表异常:", error);
        clubList.value = [];
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
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
    const getMemberStatusClass = (status) => {
      switch (status) {
        case 0:
          return "status-rejected";
        case 1:
          return "status-active";
        case 2:
          return "status-pending";
        default:
          return "status-unknown";
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
          return common_vendor.e({
            a: club.logo || "/static/images/default-club.png",
            b: common_vendor.t(club.name),
            c: club.description
          }, club.description ? {
            d: common_vendor.t(club.description)
          } : {}, {
            e: club.memberCount !== void 0
          }, club.memberCount !== void 0 ? {
            f: "4da26f5c-1-" + i0,
            g: common_vendor.p({
              type: "person",
              size: "14",
              color: "#999"
            }),
            h: common_vendor.t(club.memberCount)
          } : {}, {
            i: club.category
          }, club.category ? {
            j: "4da26f5c-2-" + i0,
            k: common_vendor.p({
              type: "flag",
              size: "14",
              color: "#999"
            }),
            l: common_vendor.t(club.category)
          } : {}, {
            m: common_vendor.t(getMemberStatusText(club.memberStatus)),
            n: common_vendor.n(getMemberStatusClass(club.memberStatus)),
            o: idx,
            p: common_vendor.o(($event) => goToDetail(club), idx)
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
        f: clubList.value.length === 0 && !isLoading.value
      }, clubList.value.length === 0 && !isLoading.value ? {
        g: common_vendor.p({
          type: "home",
          size: "80",
          color: "#ddd"
        })
      } : {}, {
        h: refreshing.value,
        i: common_vendor.o(refreshClubs),
        j: common_vendor.o(loadMore)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4da26f5c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/myClubs.js.map
