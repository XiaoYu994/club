"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_common = require("../../utils/common.js");
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
  __name: "applies",
  setup(__props) {
    const { proxy } = common_vendor.getCurrentInstance();
    const clubId = common_vendor.ref(null);
    const clubName = common_vendor.ref("");
    const currentTab = common_vendor.ref(0);
    const tabs = common_vendor.ref([
      { name: "待审核", status: 0, count: 0 },
      { name: "已通过", status: 1, count: 0 },
      { name: "已拒绝", status: 2, count: 0 },
      { name: "全部", status: -1, count: 0 }
    ]);
    const applyList = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const hasMore = common_vendor.ref(true);
    const isLoading = common_vendor.ref(false);
    const refreshing = common_vendor.ref(false);
    const currentApply = common_vendor.ref(null);
    const feedbackContent = common_vendor.ref("");
    const parsedForms = common_vendor.ref({});
    const detailPopup = common_vendor.ref(null);
    common_vendor.onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      clubId.value = currentPage.options.clubId;
      clubName.value = decodeURIComponent(currentPage.options.clubName || "");
      loadApplies();
      loadApplyCounts();
    });
    const loadApplyCounts = async () => {
      try {
        const res = await proxy.$api.club.getApplyCounts(clubId.value);
        if (res.code === 200 && res.data) {
          tabs.value[0].count = res.data.pending || 0;
          tabs.value[1].count = res.data.approved || 0;
          tabs.value[2].count = res.data.rejected || 0;
          tabs.value[3].count = res.data.total || 0;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/applies.vue:236", "加载申请计数失败", error);
      }
    };
    const loadApplies = async () => {
      if (isLoading.value)
        return;
      isLoading.value = true;
      try {
        const params = {
          pageNo: page.value,
          pageSize: pageSize.value
        };
        const status = tabs.value[currentTab.value].status;
        if (status !== -1) {
          params.status = status;
        }
        const res = await proxy.$api.club.getApplyList(clubId.value, params);
        if (res.code === 200) {
          const applies = res.data.list || [];
          if (page.value === 1) {
            applyList.value = applies;
          } else {
            applyList.value = [...applyList.value, ...applies];
          }
          hasMore.value = applies.length === pageSize.value;
          page.value++;
        } else {
          common_vendor.index.showToast({
            title: res.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/applies.vue:280", "加载申请列表失败", error);
        common_vendor.index.showToast({
          title: "网络异常，请稍后重试",
          icon: "none"
        });
      } finally {
        isLoading.value = false;
        refreshing.value = false;
      }
    };
    const refreshApplies = () => {
      refreshing.value = true;
      page.value = 1;
      hasMore.value = true;
      loadApplies();
      loadApplyCounts();
    };
    const loadMore = () => {
      if (hasMore.value && !isLoading.value) {
        loadApplies();
      }
    };
    const switchTab = (idx) => {
      if (currentTab.value === idx)
        return;
      currentTab.value = idx;
      page.value = 1;
      loadApplies();
    };
    const getStatusText = (status) => {
      switch (status) {
        case 0:
          return "待审核";
        case 1:
          return "已通过";
        case 2:
          return "已拒绝";
        case 3:
          return "已面试";
        case 4:
          return "已入社";
        default:
          return "未知";
      }
    };
    const getStatusClass = (status) => {
      switch (status) {
        case 0:
          return "pending";
        case 1:
          return "approved";
        case 2:
          return "rejected";
        case 3:
          return "interviewed";
        case 4:
          return "joined";
        default:
          return "";
      }
    };
    const getFieldLabel = (key) => {
      const labelMap = {
        name: "姓名",
        student_id: "学号",
        studentId: "学号",
        phone: "手机号",
        mobile: "手机号",
        email: "邮箱",
        college: "学院",
        class_name: "班级",
        className: "班级",
        major: "专业",
        reason: "申请理由",
        interest: "兴趣特长",
        experience: "相关经验",
        introduction: "自我介绍",
        expectation: "期望与目标",
        specialty: "专业特长",
        hobby: "爱好",
        skill: "技能",
        contact: "联系方式"
      };
      if (labelMap[key]) {
        return labelMap[key];
      }
      return key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();
    };
    const showApplyDetail = (apply) => {
      currentApply.value = apply;
      feedbackContent.value = "";
      try {
        common_vendor.index.__f__("log", "at pages/club/applies.vue:388", "表单数据:", apply.forms);
        if (apply.forms) {
          let formsData = apply.forms;
          if (typeof formsData === "string") {
            try {
              formsData = JSON.parse(formsData);
            } catch (e) {
              common_vendor.index.__f__("error", "at pages/club/applies.vue:398", "JSON解析失败:", e);
              formsData = { reason: formsData };
            }
          }
          if (Array.isArray(formsData)) {
            const obj = {};
            formsData.forEach((item) => {
              if (typeof item === "object" && item.name && item.value !== void 0) {
                obj[item.name.toLowerCase().replace(/\s/g, "_")] = item.value;
              }
            });
            formsData = obj;
          }
          if (formsData && typeof formsData === "object") {
            parsedForms.value = formsData;
            common_vendor.index.__f__("log", "at pages/club/applies.vue:418", "解析后的表单数据:", parsedForms.value);
          } else {
            parsedForms.value = {};
          }
        } else {
          parsedForms.value = {};
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/club/applies.vue:426", "解析表单数据失败", error);
        parsedForms.value = {};
      }
      detailPopup.value.open();
    };
    const closeDetailPopup = () => {
      detailPopup.value.close();
    };
    const approveApply = async () => {
      if (!currentApply.value)
        return;
      try {
        common_vendor.index.showLoading({ title: "处理中..." });
        const res = await proxy.$api.club.reviewApply(currentApply.value.id, {
          status: 1,
          // 通过
          feedback: feedbackContent.value
        });
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "已通过申请",
            icon: "success"
          });
          const index = applyList.value.findIndex((item) => item.id === currentApply.value.id);
          if (index !== -1) {
            applyList.value[index].status = 1;
            applyList.value[index].feedback = feedbackContent.value;
            applyList.value[index].reviewTime = Date.now();
          }
          tabs.value[0].count--;
          tabs.value[1].count++;
          closeDetailPopup();
          if (currentTab.value === 0) {
            refreshApplies();
          }
        } else {
          common_vendor.index.showToast({
            title: res.message || "操作失败",
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
    const rejectApply = async () => {
      if (!currentApply.value)
        return;
      if (!feedbackContent.value) {
        common_vendor.index.showToast({
          title: "请填写拒绝原因",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "处理中..." });
        const res = await proxy.$api.club.reviewApply(currentApply.value.id, {
          status: 2,
          // 拒绝
          feedback: feedbackContent.value
        });
        if (res.code === 200) {
          common_vendor.index.showToast({
            title: "已拒绝申请",
            icon: "success"
          });
          const index = applyList.value.findIndex((item) => item.id === currentApply.value.id);
          if (index !== -1) {
            applyList.value[index].status = 2;
            applyList.value[index].feedback = feedbackContent.value;
            applyList.value[index].reviewTime = Date.now();
          }
          tabs.value[0].count--;
          tabs.value[2].count++;
          closeDetailPopup();
          if (currentTab.value === 0) {
            refreshApplies();
          }
        } else {
          common_vendor.index.showToast({
            title: res.message || "操作失败",
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
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const handleManageRecruitment = () => {
      common_vendor.index.navigateTo({
        url: `/pages/club/manageRecruitment?clubId=${clubId.value}`
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          title: "社团申请 - " + clubName.value,
          showBack: true
        }),
        c: common_vendor.f(tabs.value, (tab, idx, i0) => {
          return common_vendor.e({
            a: common_vendor.t(tab.name),
            b: tab.count > 0
          }, tab.count > 0 ? {
            c: common_vendor.t(tab.count)
          } : {}, {
            d: idx,
            e: common_vendor.n(currentTab.value === idx ? "active" : ""),
            f: common_vendor.o(($event) => switchTab(idx), idx)
          });
        }),
        d: common_vendor.o(handleManageRecruitment),
        e: common_vendor.f(applyList.value, (item, idx, i0) => {
          return {
            a: item.user.avatar || "/static/images/avatar-default.png",
            b: common_vendor.t(item.user.username),
            c: common_vendor.t(getStatusText(item.status)),
            d: common_vendor.n(getStatusClass(item.status)),
            e: "21f9e556-1-" + i0,
            f: common_vendor.t(item.user.studentId || "未填写学号"),
            g: "21f9e556-2-" + i0,
            h: common_vendor.t(item.user.college || "未填写学院"),
            i: common_vendor.t(common_vendor.unref(utils_common.formatDate)(item.createTime)),
            j: idx,
            k: common_vendor.o(($event) => showApplyDetail(item), idx)
          };
        }),
        f: common_vendor.p({
          type: "person",
          size: "14",
          color: "#666"
        }),
        g: common_vendor.p({
          type: "location",
          size: "14",
          color: "#666"
        }),
        h: isLoading.value
      }, isLoading.value ? {
        i: common_vendor.p({
          type: "spinner-cycle",
          size: "20",
          color: "#999"
        })
      } : {}, {
        j: applyList.value.length === 0 && !isLoading.value
      }, applyList.value.length === 0 && !isLoading.value ? {
        k: common_assets._imports_0$6
      } : {}, {
        l: applyList.value.length > 0 && !hasMore.value
      }, applyList.value.length > 0 && !hasMore.value ? {} : {}, {
        m: refreshing.value,
        n: common_vendor.o(refreshApplies),
        o: common_vendor.o(loadMore),
        p: common_vendor.p({
          type: "close",
          size: "20",
          color: "#999"
        }),
        q: common_vendor.o(closeDetailPopup),
        r: currentApply.value
      }, currentApply.value ? common_vendor.e({
        s: currentApply.value.user.avatar || "/static/images/avatar-default.png",
        t: common_vendor.t(currentApply.value.user.username),
        v: common_vendor.t(currentApply.value.user.studentId || "未填写学号"),
        w: common_vendor.t(currentApply.value.user.college || "未填写学院"),
        x: common_vendor.t(getStatusText(currentApply.value.status)),
        y: common_vendor.n(getStatusClass(currentApply.value.status)),
        z: common_vendor.f(parsedForms.value, (value, key, index) => {
          return {
            a: common_vendor.t(getFieldLabel(key)),
            b: common_vendor.t(value),
            c: index
          };
        }),
        A: Object.keys(parsedForms.value).length === 0
      }, Object.keys(parsedForms.value).length === 0 ? {} : {}, {
        B: common_vendor.t(common_vendor.unref(utils_common.formatDate)(currentApply.value.createTime, "yyyy-MM-dd hh:mm:ss")),
        C: currentApply.value.reviewTime
      }, currentApply.value.reviewTime ? {
        D: common_vendor.t(common_vendor.unref(utils_common.formatDate)(currentApply.value.reviewTime, "yyyy-MM-dd hh:mm:ss"))
      } : {}, {
        E: currentApply.value.feedback
      }, currentApply.value.feedback ? {
        F: common_vendor.t(currentApply.value.feedback)
      } : {}, {
        G: currentApply.value.status === 0
      }, currentApply.value.status === 0 ? {
        H: feedbackContent.value,
        I: common_vendor.o(($event) => feedbackContent.value = $event.detail.value),
        J: common_vendor.o(rejectApply),
        K: common_vendor.o(approveApply)
      } : {}) : {}, {
        L: common_vendor.sr(detailPopup, "21f9e556-4", {
          "k": "detailPopup"
        }),
        M: common_vendor.p({
          type: "bottom"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-21f9e556"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/club/applies.js.map
