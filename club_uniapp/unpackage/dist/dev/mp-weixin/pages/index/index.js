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
  __name: "index",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const gridList = [
      { icon: "/static/images/notice.png", text: "公告通知" },
      { icon: "/static/images/map.png", text: "校园导览" },
      { icon: "/static/images/recommend.png", text: "所有社团" },
      { icon: "/static/images/star.png", text: "十佳社团" },
      { icon: "/static/images/join.png", text: "招新报名" },
      { icon: "/static/images/activity.png", text: "社团活动" }
    ];
    const noticeList = common_vendor.ref([]);
    const hotActivities = common_vendor.ref([]);
    const recommendClubs = common_vendor.ref([]);
    common_vendor.onMounted(() => {
      getNoticeList();
      getHotActivities();
      getRecommendClubs();
    });
    const getNoticeList = async () => {
      try {
        const res = await proxy.$api.notice.getNoticeList({ pageNo: 1, pageSize: 5 });
        if (res.code === 200) {
          noticeList.value = res.data.list || [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:162", "获取公告列表失败", error);
      }
    };
    const getHotActivities = async () => {
      try {
        const res = await proxy.$api.activity.getActivityList({
          pageNo: 1,
          pageSize: 3,
          orderBy: "join_count",
          isAsc: false
          // 按参与人数降序排列
        });
        if (res.code === 200) {
          hotActivities.value = res.data.list || [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:179", "获取热门活动失败", error);
      }
    };
    const getRecommendClubs = async () => {
      try {
        const res = await proxy.$api.club.getClubList({
          pageNo: 1,
          pageSize: 3,
          orderBy: "view_count",
          isAsc: false
          // 按浏览量降序排列
        });
        if (res.code === 200) {
          recommendClubs.value = res.data.list || [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:196", "获取推荐社团失败", error);
      }
    };
    const onGridClick = (index) => {
      switch (index) {
        case 0:
          common_vendor.index.navigateTo({ url: "/pages/notice/notice" });
          break;
        case 1:
          common_vendor.index.navigateTo({ url: "/pages/map/map" });
          break;
        case 2:
          common_vendor.index.navigateTo({ url: "/pages/club/club" });
          break;
        case 3:
          common_vendor.index.navigateTo({ url: "/pages/club/topTen" });
          break;
        case 4:
          common_vendor.index.navigateTo({ url: "/pages/club/recruitment" });
          break;
        case 5:
          common_vendor.index.switchTab({ url: "/pages/activity/activity" });
          break;
        default:
          common_vendor.index.showToast({
            title: `点击了：${gridList[index].text}`,
            icon: "none"
          });
      }
    };
    const goNotice = () => {
      common_vendor.index.navigateTo({ url: "/pages/notice/notice" });
    };
    const goToActivityDetail = (item) => {
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:252", "跳转详情页出错", error);
        common_vendor.index.navigateTo({
          url: `/pages/activity/activityDeatil?id=${item.id}`
        });
      }
    };
    const goToClubDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/club/detail?id=${item.id}`
      });
    };
    const goToActivityList = () => {
      common_vendor.index.switchTab({ url: "/pages/activity/activity" });
    };
    const goToClubList = () => {
      common_vendor.index.navigateTo({ url: "/pages/club/club" });
    };
    const getActualStatus = (activity) => {
      if (!activity)
        return -1;
      const now = Date.now();
      const startTime = Number(activity.startTime || 0);
      const endTime = Number(activity.endTime || 0);
      if (activity.status === 0) {
        return 0;
      } else if (now > endTime) {
        return 3;
      } else if (now > startTime && now < endTime) {
        return 2;
      } else {
        return 1;
      }
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
          return "planned";
        case 2:
          return "ongoing";
        case 3:
          return "ended";
        default:
          return "";
      }
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
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          title: ""
        }),
        b: common_vendor.f(gridList, (item, index, i0) => {
          return {
            a: item.icon,
            b: common_vendor.t(item.text),
            c: index,
            d: common_vendor.o(($event) => onGridClick(index), index)
          };
        }),
        c: common_vendor.p({
          type: "sound-filled",
          size: "20"
        }),
        d: common_vendor.f(noticeList.value, (notice, index, i0) => {
          return {
            a: common_vendor.t(notice.title),
            b: index
          };
        }),
        e: common_vendor.p({
          type: "right",
          size: "16",
          color: "#333"
        }),
        f: common_vendor.o(goNotice),
        g: hotActivities.value.length > 0
      }, hotActivities.value.length > 0 ? {
        h: common_vendor.f(hotActivities.value, (item, index, i0) => {
          return {
            a: item.poster || "/static/images/default-poster.png",
            b: common_vendor.t(item.title),
            c: "1cf27b2a-3-" + i0,
            d: common_vendor.t(common_vendor.unref(utils_common.formatDate)(new Date(Number(item.startTime)))),
            e: "1cf27b2a-4-" + i0,
            f: common_vendor.t(item.address || "待定"),
            g: common_vendor.t(getStatusText(item)),
            h: common_vendor.n(getStatusClass(item)),
            i: common_vendor.t(item.joinCount || 0),
            j: index,
            k: common_vendor.o(($event) => goToActivityDetail(item), index)
          };
        }),
        i: common_vendor.p({
          type: "calendar",
          size: "14",
          color: "#666"
        }),
        j: common_vendor.p({
          type: "location",
          size: "14",
          color: "#666"
        }),
        k: common_vendor.o(goToActivityList)
      } : {}, {
        l: recommendClubs.value.length > 0
      }, recommendClubs.value.length > 0 ? {
        m: common_vendor.f(recommendClubs.value, (item, index, i0) => {
          return {
            a: item.logo || "/static/images/default-club.png",
            b: common_vendor.t(item.name),
            c: common_vendor.t(getTypeText(item.type)),
            d: common_vendor.n(getTypeClass(item.type)),
            e: common_vendor.t(item.description || "暂无简介"),
            f: "1cf27b2a-5-" + i0,
            g: common_vendor.t(item.memberCount || 0),
            h: index,
            i: common_vendor.o(($event) => goToClubDetail(item), index)
          };
        }),
        n: common_vendor.p({
          type: "person",
          size: "14",
          color: "#666"
        }),
        o: common_vendor.o(goToClubList)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
