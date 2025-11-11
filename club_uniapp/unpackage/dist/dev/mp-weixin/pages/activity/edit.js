"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_activity = require("../../utils/activity.js");
if (!Array) {
  const _easycom_custom_nav_bar2 = common_vendor.resolveComponent("custom-nav-bar");
  _easycom_custom_nav_bar2();
}
const _easycom_custom_nav_bar = () => "../../components/custom-nav-bar/custom-nav-bar.js";
if (!Math) {
  (_easycom_custom_nav_bar + ActivityForm)();
}
const ActivityForm = () => "../../components/activity-form/activity-form.js";
const _sfc_main = {
  __name: "edit",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const statusBarHeight = common_vendor.ref(20);
    const activityData = common_vendor.ref({});
    const isEdit = common_vendor.ref(false);
    const clubId = common_vendor.ref("");
    common_vendor.onMounted(() => {
      statusBarHeight.value = common_vendor.index.getSystemInfoSync().statusBarHeight || 20;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options || {};
      const activityId = options.id;
      clubId.value = options.clubId || "";
      isEdit.value = !!activityId;
      if (isEdit.value) {
        loadActivityData(activityId);
      }
    });
    const loadActivityData = async (id) => {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await proxy.$api.activity.getActivityDetail(id);
        if (res.code === 200) {
          activityData.value = res.data;
          if (!clubId.value && activityData.value.clubId) {
            clubId.value = activityData.value.clubId;
          }
        } else {
          common_vendor.index.showToast({
            title: res.message || "加载失败",
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
    };
    const handleSubmit = async (formData) => {
      try {
        common_vendor.index.showLoading({ title: "提交中..." });
        if (!formData.title || !formData.address || !formData.description) {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "请完善活动信息",
            icon: "none"
          });
          return;
        }
        let res;
        try {
          if (isEdit.value) {
            formData.updateTime = Date.now();
            res = await proxy.$api.activity.updateActivity(formData);
          } else {
            formData.createTime = Date.now();
            res = await proxy.$api.activity.createActivity(formData);
          }
        } catch (networkError) {
          common_vendor.index.__f__("error", "at pages/activity/edit.vue:123", "API请求失败:", networkError);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "网络异常，请检查网络连接后重试",
            icon: "none",
            duration: 3e3
          });
          return;
        }
        if (res && (res.code === 200 || res.code === 0)) {
          utils_activity.notifyActivityDataChanged();
          common_vendor.index.showToast({
            title: isEdit.value ? "编辑成功" : "创建成功",
            icon: "success"
          });
          setTimeout(() => {
            var _a;
            const activityId = isEdit.value ? formData.id : ((_a = res.data) == null ? void 0 : _a.id) || res.data;
            if (activityId) {
              common_vendor.index.redirectTo({
                url: `/pages/activity/activityDeatil?id=${activityId}&t=${Date.now()}`
              });
            } else if (clubId.value) {
              common_vendor.index.redirectTo({
                url: `/pages/club/detail?id=${clubId.value}`
              });
            } else {
              common_vendor.index.switchTab({
                url: "/pages/activity/activity"
              });
            }
          }, 800);
        } else {
          common_vendor.index.showToast({
            title: (res == null ? void 0 : res.message) || (res == null ? void 0 : res.msg) || "提交失败，请稍后重试",
            icon: "none",
            duration: 2e3
          });
          common_vendor.index.__f__("error", "at pages/activity/edit.vue:170", "提交失败:", res);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/activity/edit.vue:173", "处理提交过程中发生错误:", error);
        common_vendor.index.showToast({
          title: "操作异常，请稍后重试",
          icon: "none",
          duration: 2e3
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const goBack = () => {
      utils_activity.notifyActivityDataChanged();
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 100);
    };
    return (_ctx, _cache) => {
      return {
        a: statusBarHeight.value + "px",
        b: common_vendor.o(goBack),
        c: common_vendor.p({
          title: isEdit.value ? "编辑活动" : "创建活动",
          showBack: true
        }),
        d: common_vendor.o(goBack),
        e: common_vendor.o(handleSubmit),
        f: common_vendor.p({
          ["activity-data"]: activityData.value,
          ["is-edit"]: isEdit.value,
          ["club-id"]: clubId.value
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8333b4c7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/activity/edit.js.map
